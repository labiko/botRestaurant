using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace TARIDIA.Areas.LengoPay.Controllers
{
    /// <summary>
    /// Contrôleur pour gérer les paiements LengoPay des restaurants
    /// </summary>
    [RoutePrefix("api")]
    public class RestaurantLengoPayController : Controller
    {
        private readonly RestaurantLengoPayService paymentService;

        public RestaurantLengoPayController()
        {
            ServicePointManager.SecurityProtocol = ServicePointManager.SecurityProtocol | SecurityProtocolType.Tls12;
            paymentService = new RestaurantLengoPayService();
        }

        /// <summary>
        /// Déclencher un paiement pour une commande restaurant
        /// URL: /api/TriggerPaymentForRestaurant
        /// </summary>
        [HttpPost]
        [Route("TriggerPaymentForRestaurant")]
        public async Task<ActionResult> TriggerPaymentForRestaurant()
        {
            try
            {
                // Lire le JSON du body de la requête
                string jsonBody = "";
                using (var reader = new StreamReader(Request.InputStream))
                {
                    reader.BaseStream.Seek(0, SeekOrigin.Begin);
                    jsonBody = reader.ReadToEnd();
                }

                // Désérialiser les paramètres
                dynamic requestData = Newtonsoft.Json.JsonConvert.DeserializeObject(jsonBody);
                string restaurantId = requestData?.restaurantId?.ToString();
                string commandeId = requestData?.commandeId?.ToString();

                // Fallback pour GET avec query parameters (compatibilité)
                if (string.IsNullOrEmpty(restaurantId))
                {
                    restaurantId = Request.QueryString["restaurantId"];
                }
                if (string.IsNullOrEmpty(commandeId))
                {
                    commandeId = Request.QueryString["commandeId"];
                }

                // Validation
                if (string.IsNullOrEmpty(restaurantId) || string.IsNullOrEmpty(commandeId))
                {
                    return Json(new
                    {
                        success = false,
                        message = "Paramètres manquants: restaurantId et commandeId requis",
                        timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
                    }, JsonRequestBehavior.AllowGet);
                }

                // Appeler le service
                var result = await paymentService.TriggerPaymentForRestaurant(restaurantId, commandeId);

                // Retourner la réponse
                return Json(new
                {
                    success = result.Success,
                    message = result.Message,
                    paymentId = result.PaymentId,
                    paymentUrl = result.PaymentUrl,
                    amount = result.Amount,
                    currency = result.Currency,
                    notificationSent = result.NotificationSent,
                    duration = result.Duration,
                    logs = result.Logs,
                    error = result.ErrorDetails
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Erreur lors du traitement de la requête",
                    error = ex.Message,
                    timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
                }, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// Version GET pour compatibilité (à terme, utiliser POST)
        /// URL: /api/TriggerPaymentForRestaurant?restaurantId=xxx&commandeId=yyy
        /// </summary>
        [HttpGet]
        [Route("TriggerPaymentForRestaurant")]
        public async Task<ActionResult> TriggerPaymentForRestaurantGet(string restaurantId, string commandeId)
        {
            try
            {
                // Validation
                if (string.IsNullOrEmpty(restaurantId) || string.IsNullOrEmpty(commandeId))
                {
                    return Json(new
                    {
                        success = false,
                        message = "Paramètres manquants: restaurantId et commandeId requis",
                        timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
                    }, JsonRequestBehavior.AllowGet);
                }

                // Appeler le service
                var result = await paymentService.TriggerPaymentForRestaurant(restaurantId, commandeId);

                // Retourner la réponse
                return Json(new
                {
                    success = result.Success,
                    message = result.Message,
                    paymentId = result.PaymentId,
                    paymentUrl = result.PaymentUrl,
                    amount = result.Amount,
                    currency = result.Currency,
                    notificationSent = result.NotificationSent,
                    duration = result.Duration,
                    logs = result.Logs,
                    error = result.ErrorDetails
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Erreur lors du traitement de la requête",
                    error = ex.Message,
                    timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
                }, JsonRequestBehavior.AllowGet);
            }
        }

        /// <summary>
        /// Callback pour recevoir les notifications de LengoPay
        /// URL: /api/RestaurantLengoPayCallback
        /// </summary>
        [HttpPost] // FORCER POST uniquement
        [Route("RestaurantLengoPayCallback")]
        public async Task<ActionResult> RestaurantLengoPayCallback()
        {
            try
            {
                // Méthode alternative pour lire le body - éviter les problèmes de stream
                string jsonBody = "";
                
                // Méthode 1: Essayer avec HttpContext
                if (HttpContext.Request.ContentLength > 0)
                {
                    var buffer = new byte[HttpContext.Request.ContentLength];
                    HttpContext.Request.InputStream.Read(buffer, 0, buffer.Length);
                    jsonBody = System.Text.Encoding.UTF8.GetString(buffer);
                }
                
                // Méthode 2: Si la méthode 1 échoue, essayer la méthode traditionnelle
                if (string.IsNullOrEmpty(jsonBody))
                {
                    try
                    {
                        HttpContext.Request.InputStream.Position = 0;
                        using (var reader = new StreamReader(HttpContext.Request.InputStream))
                        {
                            jsonBody = reader.ReadToEnd();
                        }
                    }
                    catch (Exception streamEx)
                    {
                        // Log l'erreur de lecture du stream mais continue le traitement
                        System.Diagnostics.Trace.TraceError($"Stream read error: {streamEx.Message}");
                    }
                }

                System.Diagnostics.Trace.TraceInformation($"RestaurantLengoPayCallback received: {jsonBody}");

                // Traiter le callback via le service
                var result = await paymentService.ProcessRestaurantPaymentCallback(jsonBody);

                // Retourner la page HTML générée par le service
                return Content(result.HtmlResponse, "text/html");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceError($"RestaurantLengoPayCallback Error: {ex.Message}");

                // Page d'erreur générique en cas d'exception non gérée
                var errorHtml = ex.Message;
                return Content(errorHtml, "text/html");
            }
        }

        /// <summary>
        /// GET handler pour les redirections LengoPay après paiement
        /// </summary>
        [HttpGet]
        [Route("RestaurantLengoPayCallback")]
        public ActionResult RestaurantLengoPayCallbackInfo()
        {
            var userAgent = HttpContext.Request.Headers["User-Agent"] ?? "";
            var referer = HttpContext.Request.Headers["Referer"] ?? "";
            var source = Request.QueryString["source"];
            
            var html = paymentService.HandleGetRequest(userAgent, referer, source);
            return Content(html, "text/html");
        }

    }
}