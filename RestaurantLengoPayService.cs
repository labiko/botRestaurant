using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace TARIDIA.Areas.LengoPay
{
    // Modèles de données pour Restaurant Payment
    public class RestaurantPaymentRequest
    {
        public string RestaurantId { get; set; }
        public string CommandeId { get; set; }
    }

    public class RestaurantPaymentConfig
    {
        public string Id { get; set; }
        public string RestaurantId { get; set; }
        public string ProviderName { get; set; }
        public bool IsActive { get; set; }
        public string ApiUrl { get; set; }
        public string LicenseKey { get; set; }
        public string WebsiteId { get; set; }
        public string CallbackUrl { get; set; }
        public string GreenApiInstanceId { get; set; }
        public string GreenApiToken { get; set; }
        public string GreenApiBaseUrl { get; set; }
        public string TelephoneMarchand { get; set; }
    }

    public class RestaurantData
    {
        public string Id { get; set; }
        public string Nom { get; set; }
        public string Currency { get; set; }
        public string Telephone { get; set; }
    }

    public class CommandeData
    {
        public string Id { get; set; }
        public string NumeroCommande { get; set; }
        public string ClientId { get; set; }
        public string RestaurantId { get; set; }
        public decimal Total { get; set; }
        public string Statut { get; set; }
        public string PaiementMode { get; set; }
        public string PaiementStatut { get; set; }
    }

    public class ClientData
    {
        public string Id { get; set; }
        public string PhoneWhatsapp { get; set; }
        public string Nom { get; set; }
    }

    public class RestaurantPaymentResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string PaymentId { get; set; }
        public string PaymentUrl { get; set; }
        public string Currency { get; set; }
        public decimal Amount { get; set; }
        public bool NotificationSent { get; set; }
        public List<string> Logs { get; set; }
        public double Duration { get; set; }
        public string ErrorDetails { get; set; }
        public string HtmlResponse { get; set; }

        public RestaurantPaymentResult()
        {
            Logs = new List<string>();
        }
    }

    // Modèle pour créer un paiement LengoPay
    public class RestaurantLengoPayRequest
    {
        public string websiteid { get; set; }
        public decimal amount { get; set; }
        public string currency { get; set; }
        public string type_account { get; set; }  // lp-om-gn pour Orange Money Guinée
        public string account { get; set; }       // Numéro de téléphone
        public string callback_url { get; set; }
        public string return_url { get; set; }
    }

    public class RestaurantLengoPayResponse
    {
        public string status { get; set; }
        public string pay_id { get; set; }
        public string payment_url { get; set; }
    }

    /// <summary>
    /// Service pour gérer les paiements LengoPay par restaurant
    /// </summary>
    public class RestaurantLengoPayService
    {
        private readonly string supabaseUrl;
        private readonly string supabaseKey;

        public RestaurantLengoPayService()
        {
            // Configuration Supabase depuis web.config
            supabaseUrl = ConfigurationManager.AppSettings["botRestoSupabaseUrl"];
            supabaseKey = ConfigurationManager.AppSettings["botRestoSupabaseAnonKey"];
        }

        /// <summary>
        /// Déclenche un paiement pour une commande restaurant
        /// </summary>
        public async Task<RestaurantPaymentResult> TriggerPaymentForRestaurant(string restaurantId, string commandeId)
        {
            var result = new RestaurantPaymentResult();
            var startTime = DateTime.UtcNow;

            try
            {
                result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] Début du traitement pour restaurant {restaurantId}, commande {commandeId}");

                // 1. Récupérer la configuration du restaurant
                var config = GetRestaurantPaymentConfig(restaurantId);
                if (config == null || !config.IsActive)
                {
                    result.Success = false;
                    result.Message = "Configuration de paiement non trouvée ou inactive pour ce restaurant";
                    result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] ❌ Configuration non trouvée ou inactive");
                    return result;
                }

                // 2. Récupérer les données de la commande
                var commandeData = GetCommandeData(commandeId);
                if (commandeData == null)
                {
                    result.Success = false;
                    result.Message = "Commande non trouvée";
                    result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] ❌ Commande {commandeId} non trouvée");
                    return result;
                }

                // 3. Récupérer les données du client
                var clientData = GetClientData(commandeData.ClientId);
                if (clientData == null)
                {
                    result.Success = false;
                    result.Message = "Client non trouvé";
                    result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] ❌ Client non trouvé");
                    return result;
                }

                // 4. Récupérer les données du restaurant (pour la devise)
                var restaurantData = GetRestaurantData(restaurantId);
                if (restaurantData == null)
                {
                    result.Success = false;
                    result.Message = "Restaurant non trouvé";
                    result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] ❌ Restaurant non trouvé");
                    return result;
                }

                result.Currency = restaurantData.Currency;
                result.Amount = commandeData.Total;
                result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] 📊 Montant: {commandeData.Total} {restaurantData.Currency}");
                result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] 📱 Client: {clientData.PhoneWhatsapp}");

                // 5. Créer le paiement avec LengoPay
                var paymentRequest = new RestaurantLengoPayRequest
                {
                    websiteid = config.WebsiteId,
                    amount = commandeData.Total,
                    currency = restaurantData.Currency,
                    type_account = GetAccountType(restaurantData.Currency),
                    account = config.TelephoneMarchand ?? "628406028", // Utilise telephone_marchand de la config, fallback sur test
                    callback_url = config.CallbackUrl,
                    return_url = config.CallbackUrl
                };

                var paymentResponse = await CreatePaymentViaEdgeFunction(restaurantId, commandeId, commandeData.Total, clientData.PhoneWhatsapp);
                if (paymentResponse == null)
                {
                    result.Success = false;
                    result.Message = "Erreur lors de la création du paiement - Réponse nulle de LengoPay";
                    result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] ❌ CreateLengoPayPayment a retourné null");
                    result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] URL API: {config.ApiUrl}");
                    result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] WebsiteId: {config.WebsiteId}");
                    result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] Montant: {paymentRequest.amount} {paymentRequest.currency}");
                    result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] Téléphone: {paymentRequest.account}");
                    return result;
                }
                if (paymentResponse.status != "success")
                {
                    result.Success = false;
                    result.Message = $"Erreur LengoPay - Status: {paymentResponse.status}";
                    result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] ❌ Status LengoPay: {paymentResponse.status}");
                    result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] PaymentResponse: {JsonConvert.SerializeObject(paymentResponse)}");
                    return result;
                }

                result.PaymentId = paymentResponse.pay_id;
                result.PaymentUrl = paymentResponse.payment_url;
                result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] ✅ Paiement créé: {paymentResponse.pay_id}");

                // 6. L'Edge Function a déjà enregistré le paiement dans restaurant_payments
                // Pas besoin de double insertion

                // 7. Envoyer notification WhatsApp au client
                if (!string.IsNullOrEmpty(config.GreenApiInstanceId) && !string.IsNullOrEmpty(config.GreenApiToken))
                {
                    var notificationSent = await SendWhatsAppNotification(config, clientData.PhoneWhatsapp,
                        restaurantData.Nom, commandeData.NumeroCommande, paymentResponse.payment_url,
                        commandeData.Total, restaurantData.Currency);

                    result.NotificationSent = notificationSent;
                    result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] {(notificationSent ? "✅" : "⚠️")} Notification WhatsApp {(notificationSent ? "envoyée" : "échouée")}");
                }

                // 8. Mettre à jour le statut de la commande
                UpdateCommandePaymentStatus(commandeId, "en_attente", paymentResponse.pay_id);

                result.Success = true;
                result.Message = "Paiement initié avec succès";
                result.Duration = (DateTime.UtcNow - startTime).TotalSeconds;
                result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] ✅ Traitement terminé en {result.Duration:F2}s");

                return result;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = "Erreur lors du traitement du paiement";
                result.ErrorDetails = ex.ToString();
                result.Duration = (DateTime.UtcNow - startTime).TotalSeconds;
                result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] ❌ Erreur: {ex.Message}");
                return result;
            }
        }

        private RestaurantPaymentConfig GetRestaurantPaymentConfig(string restaurantId)
        {
            try
            {
                var url = $"{supabaseUrl}/rest/v1/restaurant_payment_config?restaurant_id=eq.{restaurantId}&provider_name=eq.lengopay&is_active=eq.true&limit=1";

                using (var client = new WebClient())
                {
                    client.Headers[HttpRequestHeader.Authorization] = $"Bearer {supabaseKey}";
                    client.Headers["apikey"] = supabaseKey;
                    client.Headers[HttpRequestHeader.ContentType] = "application/json";
                    client.Encoding = Encoding.UTF8;

                    var json = client.DownloadString(url);
                    var configs = JsonConvert.DeserializeObject<List<dynamic>>(json);

                    if (configs != null && configs.Count > 0)
                    {
                        var config = configs[0];
                        return new RestaurantPaymentConfig
                        {
                            Id = config.id?.ToString(),
                            RestaurantId = config.restaurant_id?.ToString(),
                            ProviderName = config.provider_name?.ToString(),
                            IsActive = config.is_active ?? false,
                            ApiUrl = config.api_url?.ToString(),
                            LicenseKey = config.license_key?.ToString(),
                            WebsiteId = config.website_id?.ToString(),
                            CallbackUrl = config.callback_url?.ToString(),
                            GreenApiInstanceId = config.green_api_instance_id?.ToString(),
                            GreenApiToken = config.green_api_token?.ToString(),
                            GreenApiBaseUrl = config.green_api_base_url?.ToString(),
                            TelephoneMarchand = config.telephone_marchand?.ToString()
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                // Log error
            }
            return null;
        }

        private CommandeData GetCommandeData(string commandeId)
        {
            try
            {
                var url = $"{supabaseUrl}/rest/v1/commandes?id=eq.{commandeId}&select=id,numero_commande,client_id,restaurant_id,total,statut,paiement_mode,paiement_statut";

                using (var client = new WebClient())
                {
                    client.Headers[HttpRequestHeader.Authorization] = $"Bearer {supabaseKey}";
                    client.Headers["apikey"] = supabaseKey;
                    client.Headers[HttpRequestHeader.ContentType] = "application/json";
                    client.Encoding = Encoding.UTF8;

                    var json = client.DownloadString(url);
                    var commandes = JsonConvert.DeserializeObject<List<dynamic>>(json);

                    if (commandes != null && commandes.Count > 0)
                    {
                        var commande = commandes[0];
                        return new CommandeData
                        {
                            Id = commande.id?.ToString(),
                            NumeroCommande = commande.numero_commande?.ToString(),
                            ClientId = commande.client_id?.ToString(),
                            RestaurantId = commande.restaurant_id?.ToString(),
                            Total = Convert.ToDecimal(commande.total ?? 0),
                            Statut = commande.statut?.ToString(),
                            PaiementMode = commande.paiement_mode?.ToString(),
                            PaiementStatut = commande.paiement_statut?.ToString()
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                // Log error
            }
            return null;
        }

        private ClientData GetClientData(string clientId)
        {
            try
            {
                var url = $"{supabaseUrl}/rest/v1/clients?id=eq.{clientId}&select=id,phone_whatsapp,nom";

                using (var client = new WebClient())
                {
                    client.Headers[HttpRequestHeader.Authorization] = $"Bearer {supabaseKey}";
                    client.Headers["apikey"] = supabaseKey;
                    client.Headers[HttpRequestHeader.ContentType] = "application/json";
                    client.Encoding = Encoding.UTF8;

                    var json = client.DownloadString(url);
                    var clients = JsonConvert.DeserializeObject<List<dynamic>>(json);

                    if (clients != null && clients.Count > 0)
                    {
                        var clientData = clients[0];
                        return new ClientData
                        {
                            Id = clientData.id?.ToString(),
                            PhoneWhatsapp = clientData.phone_whatsapp?.ToString(),
                            Nom = clientData.nom?.ToString()
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                // Log error
            }
            return null;
        }

        private RestaurantData GetRestaurantData(string restaurantId)
        {
            try
            {
                var url = $"{supabaseUrl}/rest/v1/restaurants?id=eq.{restaurantId}&select=id,nom,currency,telephone";

                using (var client = new WebClient())
                {
                    client.Headers[HttpRequestHeader.Authorization] = $"Bearer {supabaseKey}";
                    client.Headers["apikey"] = supabaseKey;
                    client.Headers[HttpRequestHeader.ContentType] = "application/json";
                    client.Encoding = Encoding.UTF8;

                    var json = client.DownloadString(url);
                    var restaurants = JsonConvert.DeserializeObject<List<dynamic>>(json);

                    if (restaurants != null && restaurants.Count > 0)
                    {
                        var restaurant = restaurants[0];
                        return new RestaurantData
                        {
                            Id = restaurant.id?.ToString(),
                            Nom = restaurant.nom?.ToString(),
                            Currency = restaurant.currency?.ToString() ?? "GNF",
                            Telephone = restaurant.telephone?.ToString()
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                // Log error
            }
            return null;
        }

        private async Task<RestaurantLengoPayResponse> CreatePaymentViaEdgeFunction(string restaurantId, string commandeId, decimal amount, string clientPhone)
        {
            try
            {
                using (var client = new WebClient())
                {
                    client.Headers[HttpRequestHeader.Authorization] = $"Bearer {supabaseKey}";
                    client.Headers["Content-Type"] = "application/json";
                    client.Encoding = Encoding.UTF8;

                    var edgeFunctionUrl = $"{supabaseUrl}/functions/v1/restaurant-payment-service?action=create";
                    var payload = JsonConvert.SerializeObject(new
                    {
                        restaurantId = restaurantId,
                        commandeId = commandeId,
                        amount = amount,
                        clientPhone = clientPhone
                    });

                    System.Diagnostics.Debug.WriteLine($"[EdgeFunction] URL: {edgeFunctionUrl}");
                    System.Diagnostics.Debug.WriteLine($"[EdgeFunction] Payload: {payload}");

                    var response = client.UploadString(edgeFunctionUrl, "POST", payload);
                    System.Diagnostics.Debug.WriteLine($"[EdgeFunction] Response: {response}");

                    var edgeResponse = JsonConvert.DeserializeObject<dynamic>(response);

                    if (edgeResponse?.success == true)
                    {
                        return new RestaurantLengoPayResponse
                        {
                            status = "success",
                            pay_id = edgeResponse.paymentId?.ToString(),
                            payment_url = edgeResponse.paymentUrl?.ToString()
                        };
                    }
                    else
                    {
                        System.Diagnostics.Debug.WriteLine($"[EdgeFunction] Échec: {edgeResponse?.message}");
                        return null;
                    }
                }
            }
            catch (WebException webEx)
            {
                string errorDetails = "WebException: " + webEx.Message;
                if (webEx.Response != null)
                {
                    using (var errorStream = webEx.Response.GetResponseStream())
                    using (var reader = new StreamReader(errorStream))
                    {
                        errorDetails += " | Response: " + reader.ReadToEnd();
                    }
                }

                System.Diagnostics.Debug.WriteLine($"[EdgeFunction] WebException: {errorDetails}");
                return null;
            }
            catch (Exception ex)
            {
                string errorDetails = $"Exception: {ex.Message}";
                if (ex.InnerException != null)
                {
                    errorDetails += $" | Inner: {ex.InnerException.Message}";
                }
                errorDetails += $" | Stack: {ex.StackTrace}";

                System.Diagnostics.Debug.WriteLine($"[EdgeFunction] Exception: {errorDetails}");
                return null;
            }
        }

        private void SaveRestaurantPayment(string restaurantId, string commandeId, RestaurantLengoPayResponse paymentResponse,
            decimal amount, string currency, string clientPhone)
        {
            try
            {
                var url = $"{supabaseUrl}/rest/v1/restaurant_payments";

                var payload = new
                {
                    restaurant_id = restaurantId,
                    commande_id = string.IsNullOrEmpty(commandeId) ? null : commandeId,
                    payment_id = paymentResponse.pay_id,
                    status = "PENDING",
                    amount = amount,
                    client_phone = clientPhone,
                    message = "Paiement initié depuis bot restaurant",
                    payment_url = paymentResponse.payment_url,
                    raw_json = paymentResponse
                };

                using (var client = new WebClient())
                {
                    client.Headers[HttpRequestHeader.Authorization] = $"Bearer {supabaseKey}";
                    client.Headers["apikey"] = supabaseKey;
                    client.Headers[HttpRequestHeader.ContentType] = "application/json";
                    client.Headers["Prefer"] = "return=minimal";
                    client.Encoding = Encoding.UTF8;

                    string jsonPayload = JsonConvert.SerializeObject(payload);
                    client.UploadString(url, "POST", jsonPayload);
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur SaveRestaurantPayment: {ex.Message}", ex);
            }
        }

        private void UpdateCommandePaymentStatus(string commandeId, string status, string paymentId)
        {
            try
            {
                var url = $"{supabaseUrl}/rest/v1/commandes?id=eq.{commandeId}";

                // D'abord récupérer la note actuelle
                string currentNote = "";
                using (var client = new WebClient())
                {
                    client.Headers[HttpRequestHeader.Authorization] = $"Bearer {supabaseKey}";
                    client.Headers["apikey"] = supabaseKey;
                    client.Headers[HttpRequestHeader.ContentType] = "application/json";
                    client.Encoding = Encoding.UTF8;

                    var json = client.DownloadString(url + "&select=note_restaurant");
                    var commandes = JsonConvert.DeserializeObject<List<dynamic>>(json);
                    if (commandes != null && commandes.Count > 0)
                    {
                        currentNote = commandes[0].note_restaurant?.ToString() ?? "";
                    }
                }

                // Puis mettre à jour avec PATCH
                var payload = new
                {
                    paiement_statut = status,
                    note_restaurant = currentNote + " | Payment ID: " + paymentId
                };

                using (var client = new WebClient())
                {
                    client.Headers[HttpRequestHeader.Authorization] = $"Bearer {supabaseKey}";
                    client.Headers["apikey"] = supabaseKey;
                    client.Headers[HttpRequestHeader.ContentType] = "application/json";
                    client.Headers["Prefer"] = "return=representation";
                    client.Encoding = Encoding.UTF8;

                    string jsonPayload = JsonConvert.SerializeObject(payload);
                    client.UploadString(url, "PATCH", jsonPayload);
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur UpdateCommandePaymentStatus: {ex.Message}", ex);
            }
        }

        private async Task<bool> SendWhatsAppNotification(RestaurantPaymentConfig config, string phoneNumber,
            string restaurantName, string orderNumber, string paymentUrl, decimal amount, string currency)
        {
            try
            {
                var message = $@"🍽️ *{restaurantName}*

💳 Votre demande de paiement pour la commande *{orderNumber}*

💰 Montant: *{amount:N0} {currency}*

📲 Cliquez sur le lien ci-dessous pour payer:
{paymentUrl}

⏱️ Ce lien expire dans 15 minutes.

Merci de votre confiance! 🙏";

                var url = $"{config.GreenApiBaseUrl}/waInstance{config.GreenApiInstanceId}/sendMessage/{config.GreenApiToken}";
                var request = (HttpWebRequest)WebRequest.Create(url);
                request.Method = "POST";
                request.ContentType = "application/json";

                var payload = new
                {
                    chatId = FormatPhoneForWhatsApp(phoneNumber),
                    message = message
                };

                var json = JsonConvert.SerializeObject(payload);
                var data = Encoding.UTF8.GetBytes(json);

                using (var stream = await request.GetRequestStreamAsync())
                {
                    await stream.WriteAsync(data, 0, data.Length);
                }

                using (var response = (HttpWebResponse)await request.GetResponseAsync())
                {
                    return response.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }

        private string GetAccountType(string currency)
        {
            // Déterminer le type de compte selon la devise
            switch (currency?.ToUpper())
            {
                case "GNF":
                    return "lp-om-gn"; // Orange Money Guinée
                case "EUR":
                    return "lp-cb"; // Carte bancaire pour EUR
                default:
                    return "lp-om-gn";
            }
        }

        private string FormatPhoneNumber(string phone)
        {
            // Nettoyer le numéro de téléphone
            phone = phone.Replace("+", "").Replace(" ", "").Replace("-", "");

            // Si c'est un numéro guinéen sans indicatif, ajouter 224
            if (phone.Length == 9 && !phone.StartsWith("224"))
            {
                phone = "224" + phone;
            }

            return phone;
        }

        private string FormatPhoneForWhatsApp(string phone)
        {
            phone = FormatPhoneNumber(phone);
            return phone + "@c.us";
        }

        /// <summary>
        /// Traiter les callbacks de paiement LengoPay pour restaurants
        /// </summary>
        public async Task<RestaurantPaymentResult> ProcessRestaurantPaymentCallback(string jsonBody)
        {
            var result = new RestaurantPaymentResult();
            var startTime = DateTime.UtcNow;

            string orderNumber = "N/A";
            string restaurantName = "Restaurant";
            string amount = "0";

            try
            {
                result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] Callback reçu: {jsonBody}");

                // Désérialiser le callback LengoPay
                dynamic callbackData = JsonConvert.DeserializeObject(jsonBody);

                string paymentId = callbackData?.pay_id?.ToString();
                string status = callbackData?.status?.ToString();
                string message = callbackData?.message?.ToString();

                // Extraire les données pour l'affichage HTML
                try
                {
                    orderNumber = callbackData?.orderNumber?.ToString() ?? "N/A";
                    restaurantName = callbackData?.restaurantName?.ToString() ?? "Restaurant";
                    amount = callbackData?.amount?.ToString() ?? "0";
                }
                catch
                {
                    // Si extraction échoue, récupérer depuis la base de données
                    if (!string.IsNullOrEmpty(paymentId))
                    {
                        var commandeId = GetCommandeIdFromPayment(paymentId);
                        if (!string.IsNullOrEmpty(commandeId))
                        {
                            var commandeData = GetCommandeData(commandeId);
                            if (commandeData != null)
                            {
                                orderNumber = commandeData.NumeroCommande;
                                amount = commandeData.Total.ToString("N0");

                                var restaurantData = GetRestaurantData(commandeData.RestaurantId);
                                if (restaurantData != null)
                                {
                                    restaurantName = restaurantData.Nom;
                                }
                            }
                        }
                    }
                }

                if (string.IsNullOrEmpty(paymentId))
                {
                    result.Success = false;
                    result.Message = "Payment ID manquant dans le callback";
                    result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] ❌ Payment ID manquant");
                    
                    // Utiliser la nouvelle page moderne d'erreur
                    result.HtmlResponse = GetErrorPage(orderNumber, restaurantName, "Données de paiement incomplètes reçues");
                    return result;
                }

                result.PaymentId = paymentId;
                result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] Processing payment: {paymentId}, status: {status}");

                // Mettre à jour le statut dans restaurant_payments
                var updateSuccess = UpdateRestaurantPaymentStatus(paymentId, status, message, jsonBody);

                if (updateSuccess)
                {
                    result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] ✅ Statut mis à jour dans restaurant_payments");

                    // Si paiement réussi, mettre à jour aussi la commande
                    if (status?.ToUpper() == "SUCCESS")
                    {
                        var commandeId = GetCommandeIdFromPayment(paymentId);
                        if (!string.IsNullOrEmpty(commandeId))
                        {
                            UpdateCommandePaymentStatus(commandeId, "paye", paymentId);
                            result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] ✅ Commande {commandeId} marquée comme payée");

                            // 2. Notifier le vrai client de la commande
                            var notificationSent = await NotifyClientPaymentSuccess(commandeId, paymentId);
                            result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] {(notificationSent ? "✅" : "⚠️")} Notification client {(notificationSent ? "envoyée" : "échouée")}");
                        }

                        result.Success = true;
                        result.Message = "Callback traité avec succès";
                        result.HtmlResponse = GetSuccessPage(orderNumber, restaurantName, amount);
                    }
                    else
                    {
                        result.Success = false;
                        result.Message = $"Paiement échoué - Status: {status}";
                        result.HtmlResponse = GetErrorPage(orderNumber, restaurantName, message ?? $"Status: {status}");
                    }
                }
                else
                {
                    result.Success = false;
                    result.Message = "Erreur lors de la mise à jour du statut";
                    result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] ❌ Échec mise à jour statut");
                    result.HtmlResponse = GetErrorPage(orderNumber, restaurantName, "Erreur lors de la mise à jour du statut");
                }

                result.Duration = (DateTime.UtcNow - startTime).TotalSeconds;
                result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] Callback traité en {result.Duration:F2}s");

                return result;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = "Erreur lors du traitement du callback";
                result.ErrorDetails = ex.ToString();
                result.Duration = (DateTime.UtcNow - startTime).TotalSeconds;
                result.Logs.Add($"[{DateTime.UtcNow:HH:mm:ss}] ❌ Erreur: {ex.Message}");
                result.HtmlResponse = GetErrorPage(orderNumber, restaurantName, "Erreur technique lors du traitement");
                return result;
            }
        }

        private bool UpdateRestaurantPaymentStatus(string paymentId, string status, string message, string rawJson)
        {
            try
            {
                var url = $"{supabaseUrl}/rest/v1/restaurant_payments?payment_id=eq.{paymentId}";

                var payload = new
                {
                    status = status?.ToUpper(),
                    message = message,
                    raw_json = JsonConvert.DeserializeObject(rawJson),
                    updated_at = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    processed_at = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                };

                using (var client = new WebClient())
                {
                    client.Headers[HttpRequestHeader.Authorization] = $"Bearer {supabaseKey}";
                    client.Headers["apikey"] = supabaseKey;
                    client.Headers[HttpRequestHeader.ContentType] = "application/json";
                    client.Headers["Prefer"] = "return=minimal";
                    client.Encoding = Encoding.UTF8;

                    string jsonPayload = JsonConvert.SerializeObject(payload);
                    client.UploadString(url, "PATCH", jsonPayload);
                    return true;
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceError($"UpdateRestaurantPaymentStatus Error: {ex.Message}");
                return false;
            }
        }

        private string GetCommandeIdFromPayment(string paymentId)
        {
            try
            {
                var url = $"{supabaseUrl}/rest/v1/restaurant_payments?payment_id=eq.{paymentId}&select=commande_id";

                using (var client = new WebClient())
                {
                    client.Headers[HttpRequestHeader.Authorization] = $"Bearer {supabaseKey}";
                    client.Headers["apikey"] = supabaseKey;
                    client.Headers[HttpRequestHeader.ContentType] = "application/json";
                    client.Encoding = Encoding.UTF8;

                    var json = client.DownloadString(url);
                    var payments = JsonConvert.DeserializeObject<List<dynamic>>(json);

                    if (payments != null && payments.Count > 0)
                    {
                        return payments[0].commande_id?.ToString();
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceError($"GetCommandeIdFromPayment Error: {ex.Message}");
            }
            return null;
        }

        /// <summary>
        /// Notifier le client après confirmation de paiement
        /// </summary>
        private async Task<bool> NotifyClientPaymentSuccess(string commandeId, string paymentId)
        {
            try
            {
                // Récupérer les données de la commande
                var commandeData = GetCommandeData(commandeId);
                if (commandeData == null) return false;

                // Récupérer les données du client
                var clientData = GetClientData(commandeData.ClientId);
                if (clientData == null) return false;

                // Récupérer les données du restaurant
                var restaurantData = GetRestaurantData(commandeData.RestaurantId);
                if (restaurantData == null) return false;

                // Récupérer la configuration du restaurant pour WhatsApp
                var config = GetRestaurantPaymentConfig(commandeData.RestaurantId);
                if (config == null || string.IsNullOrEmpty(config.GreenApiInstanceId) || string.IsNullOrEmpty(config.GreenApiToken))
                    return false;

                // Template moderne de notification
                var message = $@"🎉 Paiement Confirmé !

Cher(e) {clientData.Nom},

✅ Votre paiement de {commandeData.Total:N0} {restaurantData.Currency} pour la commande {commandeData.NumeroCommande} chez {restaurantData.Nom} a été confirmé avec succès !

📋 Détails :
• Commande : {commandeData.NumeroCommande}
• Restaurant : {restaurantData.Nom}
• Montant : {commandeData.Total:N0} {restaurantData.Currency}
• Heure : {DateTime.Now:HH:mm:ss}

🍽 Votre commande est maintenant confirmée et sera préparée.

Merci de votre confiance ! 🙏

---
LokoTaxi Restaurant Bot

💡 Tapez ""annuler"" pour arrêter, ""retour"" pour changer ou le numéro du resto pour accéder directement.";

                // Envoyer la notification WhatsApp
                var url = $"{config.GreenApiBaseUrl}/waInstance{config.GreenApiInstanceId}/sendMessage/{config.GreenApiToken}";
                var request = (HttpWebRequest)WebRequest.Create(url);
                request.Method = "POST";
                request.ContentType = "application/json";

                var payload = new
                {
                    chatId = FormatPhoneForWhatsApp(clientData.PhoneWhatsapp),
                    message = message
                };

                var json = JsonConvert.SerializeObject(payload);
                var data = Encoding.UTF8.GetBytes(json);

                using (var stream = await request.GetRequestStreamAsync())
                {
                    await stream.WriteAsync(data, 0, data.Length);
                }

                using (var response = (HttpWebResponse)await request.GetResponseAsync())
                {
                    var success = response.StatusCode == HttpStatusCode.OK;

                    // Marquer la notification comme envoyée dans restaurant_payments
                    if (success)
                    {
                        UpdateClientNotificationStatus(paymentId);
                    }

                    return success;
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceError($"NotifyClientPaymentSuccess Error: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Mettre à jour le statut de notification client
        /// </summary>
        private void UpdateClientNotificationStatus(string paymentId)
        {
            try
            {
                var url = $"{supabaseUrl}/rest/v1/restaurant_payments?payment_id=eq.{paymentId}";

                var payload = new
                {
                    client_notified_at = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                };

                using (var client = new WebClient())
                {
                    client.Headers[HttpRequestHeader.Authorization] = $"Bearer {supabaseKey}";
                    client.Headers["apikey"] = supabaseKey;
                    client.Headers[HttpRequestHeader.ContentType] = "application/json";
                    client.Headers["Prefer"] = "return=minimal";
                    client.Encoding = Encoding.UTF8;

                    string jsonPayload = JsonConvert.SerializeObject(payload);
                    client.UploadString(url, "PATCH", jsonPayload);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceError($"UpdateClientNotificationStatus Error: {ex.Message}");
            }
        }

        /// <summary>
        /// Génère la page HTML de succès de paiement
        /// </summary>
        private string GetSuccessPage(string orderNumber, string restaurantName, string amount)
        {
            return $@"
<!DOCTYPE html>
<html lang='fr'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Paiement Confirmé</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            overflow: hidden;
        }}
        
        .container {{
            background: white;
            border-radius: 30px;
            padding: 60px 40px;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            max-width: 450px;
            width: 100%;
            animation: slideUp 0.8s ease-out;
            position: relative;
        }}
        
        @keyframes slideUp {{
            from {{
                opacity: 0;
                transform: translateY(50px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}
        
        .success-icon {{
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 40px;
            animation: bounceIn 1s ease-out 0.3s both;
            box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
        }}
        
        .success-icon::after {{
            content: '✓';
            color: white;
            font-size: 60px;
            font-weight: bold;
        }}
        
        @keyframes bounceIn {{
            0% {{
                opacity: 0;
                transform: scale(0.3);
            }}
            50% {{
                opacity: 1;
                transform: scale(1.1);
            }}
            70% {{
                transform: scale(0.9);
            }}
            100% {{
                opacity: 1;
                transform: scale(1);
            }}
        }}
        
        h1 {{
            color: #2E7D32;
            font-size: 2.5em;
            margin-bottom: 15px;
            font-weight: 700;
            animation: fadeIn 0.8s ease-out 0.5s both;
        }}
        
        .subtitle {{
            color: #666;
            font-size: 1.2em;
            margin-bottom: 40px;
            animation: fadeIn 0.8s ease-out 0.7s both;
        }}
        
        @keyframes fadeIn {{
            from {{
                opacity: 0;
                transform: translateY(20px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}
        
        .success-message {{
            background: linear-gradient(135deg, #e8f5e8, #f1f8e9);
            border-radius: 15px;
            padding: 25px;
            margin: 30px 0;
            color: #2e7d32;
            font-size: 1.1em;
            font-weight: 500;
            animation: fadeIn 0.8s ease-out 0.9s both;
        }}
        
        .confetti {{
            position: absolute;
            width: 10px;
            height: 10px;
            background: #4CAF50;
            animation: confetti 3s ease-out infinite;
        }}
        
        .confetti:nth-child(1) {{
            left: 10%;
            animation-delay: 0s;
            background: #4CAF50;
        }}
        
        .confetti:nth-child(2) {{
            left: 20%;
            animation-delay: 0.3s;
            background: #2196F3;
        }}
        
        .confetti:nth-child(3) {{
            left: 30%;
            animation-delay: 0.6s;
            background: #FF9800;
        }}
        
        .confetti:nth-child(4) {{
            left: 40%;
            animation-delay: 0.9s;
            background: #E91E63;
        }}
        
        .confetti:nth-child(5) {{
            left: 50%;
            animation-delay: 1.2s;
            background: #9C27B0;
        }}
        
        .confetti:nth-child(6) {{
            left: 60%;
            animation-delay: 1.5s;
            background: #4CAF50;
        }}
        
        .confetti:nth-child(7) {{
            left: 70%;
            animation-delay: 1.8s;
            background: #FF5722;
        }}
        
        .confetti:nth-child(8) {{
            left: 80%;
            animation-delay: 2.1s;
            background: #009688;
        }}
        
        .confetti:nth-child(9) {{
            left: 90%;
            animation-delay: 2.4s;
            background: #FFC107;
        }}
        
        @keyframes confetti {{
            0% {{
                transform: translateY(-100vh) rotate(0deg);
                opacity: 1;
            }}
            100% {{
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }}
        }}
        
        @media (max-width: 480px) {{
            .container {{
                padding: 40px 30px;
            }}
            
            h1 {{
                font-size: 2em;
            }}
            
            .success-icon {{
                width: 100px;
                height: 100px;
            }}
            
            .success-icon::after {{
                font-size: 50px;
            }}
        }}
    </style>
</head>
<body>
    <div class='confetti'></div>
    <div class='confetti'></div>
    <div class='confetti'></div>
    <div class='confetti'></div>
    <div class='confetti'></div>
    <div class='confetti'></div>
    <div class='confetti'></div>
    <div class='confetti'></div>
    <div class='confetti'></div>
    
    <div class='container'>
        <div class='success-icon'></div>
        
        <h1>Paiement Réussi !</h1>
        <p class='subtitle'>Votre transaction a été traitée avec succès</p>
        
        <div class='success-message'>
            🎉 Félicitations ! Votre paiement a été confirmé.<br>
            Vous recevrez une confirmation par WhatsApp.
        </div>
    </div>
    
    <script>
        // Auto-fermer après 5 secondes
        setTimeout(() => {{
            if (window.opener) {{
                window.close();
            }} else {{
                window.history.back();
            }}
        }}, 5000);
    </script>
</body>
</html>";
        }

        /// <summary>
        /// Génère la page HTML d'erreur de paiement
        /// </summary>
        private string GetErrorPage(string orderNumber, string restaurantName, string errorMessage)
        {
            return $@"
<!DOCTYPE html>
<html lang='fr'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Échec de Paiement</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            overflow: hidden;
        }}
        
        .container {{
            background: white;
            border-radius: 30px;
            padding: 60px 40px;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            max-width: 450px;
            width: 100%;
            animation: slideUp 0.8s ease-out;
            position: relative;
        }}
        
        @keyframes slideUp {{
            from {{
                opacity: 0;
                transform: translateY(50px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}
        
        .error-icon {{
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #f44336, #d32f2f);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 40px;
            animation: shakeAndPulse 1s ease-out 0.3s both;
            box-shadow: 0 10px 30px rgba(244, 67, 54, 0.3);
        }}
        
        .error-icon::after {{
            content: '✕';
            color: white;
            font-size: 60px;
            font-weight: bold;
        }}
        
        @keyframes shakeAndPulse {{
            0% {{
                opacity: 0;
                transform: scale(0.3) translateX(0);
            }}
            25% {{
                opacity: 1;
                transform: scale(1.1) translateX(-10px);
            }}
            50% {{
                transform: scale(0.9) translateX(10px);
            }}
            75% {{
                transform: scale(1.05) translateX(-5px);
            }}
            100% {{
                opacity: 1;
                transform: scale(1) translateX(0);
            }}
        }}
        
        h1 {{
            color: #d32f2f;
            font-size: 2.5em;
            margin-bottom: 15px;
            font-weight: 700;
            animation: fadeIn 0.8s ease-out 0.5s both;
        }}
        
        .subtitle {{
            color: #666;
            font-size: 1.2em;
            margin-bottom: 40px;
            animation: fadeIn 0.8s ease-out 0.7s both;
        }}
        
        @keyframes fadeIn {{
            from {{
                opacity: 0;
                transform: translateY(20px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}
        
        .error-message {{
            background: linear-gradient(135deg, #ffebee, #fce4ec);
            border-left: 4px solid #f44336;
            border-radius: 15px;
            padding: 25px;
            margin: 30px 0;
            color: #d32f2f;
            font-size: 1.1em;
            font-weight: 500;
            animation: fadeIn 0.8s ease-out 0.9s both;
            text-align: left;
        }}
        
        .reassurance {{
            background: linear-gradient(135deg, #e3f2fd, #f1f8e9);
            border-radius: 15px;
            padding: 20px;
            margin: 25px 0;
            color: #1565c0;
            font-size: 1em;
            animation: fadeIn 0.8s ease-out 1.1s both;
        }}
        
        .floating-particles {{
            position: absolute;
            width: 6px;
            height: 6px;
            background: #ffcdd2;
            border-radius: 50%;
            animation: floatParticles 4s ease-in-out infinite;
        }}
        
        .floating-particles:nth-child(1) {{
            top: 20%;
            left: 10%;
            animation-delay: 0s;
        }}
        
        .floating-particles:nth-child(2) {{
            top: 30%;
            right: 15%;
            animation-delay: 0.8s;
        }}
        
        .floating-particles:nth-child(3) {{
            bottom: 25%;
            left: 20%;
            animation-delay: 1.6s;
        }}
        
        .floating-particles:nth-child(4) {{
            bottom: 35%;
            right: 20%;
            animation-delay: 2.4s;
        }}
        
        @keyframes floatParticles {{
            0%, 100% {{
                transform: translateY(0px) rotate(0deg);
                opacity: 0.7;
            }}
            50% {{
                transform: translateY(-20px) rotate(180deg);
                opacity: 1;
            }}
        }}
        
        @media (max-width: 480px) {{
            .container {{
                padding: 40px 30px;
            }}
            
            h1 {{
                font-size: 2em;
            }}
            
            .error-icon {{
                width: 100px;
                height: 100px;
            }}
            
            .error-icon::after {{
                font-size: 50px;
            }}
        }}
    </style>
</head>
<body>
    <div class='floating-particles'></div>
    <div class='floating-particles'></div>
    <div class='floating-particles'></div>
    <div class='floating-particles'></div>
    
    <div class='container'>
        <div class='error-icon'></div>
        
        <h1>Paiement Échoué</h1>
        <p class='subtitle'>Le traitement de votre paiement a rencontré un problème</p>
        
        <div class='error-message'>
            <strong>⚠️ Raison :</strong><br>
            {errorMessage}
        </div>
        
        <div class='reassurance'>
            ✅ <strong>Bonne nouvelle :</strong> Aucun montant n'a été débité de votre compte.<br>
            💬 Vous recevrez un message de confirmation par WhatsApp.
        </div>
    </div>
    
    <script>
        // Auto-fermer après 6 secondes
        setTimeout(() => {{
            if (window.opener) {{
                window.close();
            }} else {{
                window.history.back();
            }}
        }}, 6000);
    </script>
</body>
</html>";
        }

        /// <summary>
        /// Gère les accès GET - soit redirection LengoPay soit accès technique
        /// </summary>
        public string HandleGetRequest(string userAgent, string referer, string source)
        {
            // Si c'est une redirection depuis LengoPay (après paiement)
            // LengoPay ne passe pas toujours de referer, donc on assume que les GET viennent de redirections utilisateur
            if ((referer?.Contains("lengopay.com") == true) || 
                source == "lengopay" || 
                string.IsNullOrEmpty(referer)) // Pas de referer = probablement une redirection LengoPay
            {
                // Afficher page générique de paiement traité
                return GetPaymentProcessedPage();
            }
            
            // Sinon, page d'information technique
            return GetTechnicalInfoPage(userAgent, referer);
        }


        /// <summary>
        /// Page moderne pour les redirections LengoPay après paiement
        /// </summary>
        private string GetPaymentProcessedPage()
        {
            return @"
<!DOCTYPE html>
<html lang='fr'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Paiement Traité</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 25px;
            padding: 50px 40px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            max-width: 400px;
            width: 100%;
            animation: slideUp 0.6s ease-out;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .success-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 30px;
            animation: bounceIn 0.8s ease-out 0.2s both;
        }
        
        .success-icon::after {
            content: '✓';
            color: white;
            font-size: 40px;
            font-weight: bold;
        }
        
        @keyframes bounceIn {
            0% {
                opacity: 0;
                transform: scale(0.3);
            }
            50% {
                opacity: 1;
                transform: scale(1.1);
            }
            100% {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        h1 {
            color: #2E7D32;
            font-size: 2em;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .message {
            color: #666;
            font-size: 1.1em;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        
        .info-box {
            background: linear-gradient(135deg, #e8f5e8, #f1f8e9);
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            color: #2e7d32;
        }
    </style>
</head>
<body>
    <div class='container'>
        <div class='success-icon'></div>
        
        <h1>Paiement Traité</h1>
        <p class='message'>
            Votre demande de paiement a été traitée.<br>
            Le statut final vous sera communiqué par WhatsApp.
        </p>
        
        <div class='info-box'>
            📱 <strong>Vérifiez vos messages WhatsApp</strong><br>
            pour connaître le statut définitif de votre paiement.
        </div>
    </div>
    
    <script>
        // Auto-fermer après 8 secondes
        setTimeout(() => {
            if (window.opener) {
                window.close();
            } else {
                window.history.back();
            }
        }, 8000);
    </script>
</body>
</html>";
        }

        /// <summary>
        /// Page d'information technique pour les accès directs
        /// </summary>
        private string GetTechnicalInfoPage(string userAgent, string referer)
        {
            var debugInfo = new StringBuilder();
            debugInfo.AppendLine($"• <strong>Method:</strong> GET");
            debugInfo.AppendLine($"<br>• <strong>ContentLength:</strong> 0 bytes");
            debugInfo.AppendLine($"<br>• <strong>ContentType:</strong> NULL");
            debugInfo.AppendLine($"<br>• <strong>User-Agent:</strong> {userAgent ?? "NULL"}");
            debugInfo.AppendLine($"<br>• <strong>Referer:</strong> {referer ?? "NULL"}");
            debugInfo.AppendLine($"<br>• <strong>Timestamp:</strong> {DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}");

            return $@"
<!DOCTYPE html>
<html>
<head><title>LengoPay Callback Endpoint</title></head>
<body style='font-family:Arial;padding:40px;text-align:center;'>
    <h2>🔧 Endpoint LengoPay</h2>
    <p>Cet endpoint est réservé aux callbacks POST de LengoPay.</p>
    <p>Les accès GET depuis un navigateur ne sont pas supportés.</p>
    
    <div style='background:#f5f5f5;padding:20px;margin:20px;border-radius:10px;text-align:left;'>
        <h3>Debug - Informations HTTP détaillées:</h3>
        {debugInfo}
    </div>
    
    <hr>
    <small>Si vous êtes LengoPay, utilisez POST avec Content-Type: application/json</small>
</body>
</html>";
        }
    }
}