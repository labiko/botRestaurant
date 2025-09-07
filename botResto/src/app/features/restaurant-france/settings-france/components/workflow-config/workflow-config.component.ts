import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { 
  WorkflowConfigService, 
  WorkflowDefinition, 
  WorkflowStep, 
  WorkflowTemplate 
} from '../../../services/workflow-config.service';

@Component({
  selector: 'app-workflow-config',
  templateUrl: './workflow-config.component.html',
  styleUrls: ['./workflow-config.component.scss'],
  standalone: false
})
export class WorkflowConfigComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  workflows: WorkflowDefinition[] = [];
  templates: WorkflowTemplate[] = [];
  selectedWorkflow: WorkflowDefinition | null = null;
  workflowSteps: WorkflowStep[] = [];
  
  isLoading = false;
  
  // Mock restaurant ID - should come from auth service
  restaurantId = 1;

  constructor(
    private workflowConfigService: WorkflowConfigService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadWorkflows();
    this.loadTemplates();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadWorkflows() {
    const loading = await this.loadingController.create({
      message: 'Chargement des workflows...'
    });
    await loading.present();

    this.workflowConfigService.getWorkflowDefinitions(this.restaurantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (workflows) => {
          this.workflows = workflows;
          loading.dismiss();
        },
        error: (error) => {
          console.error('Error loading workflows:', error);
          this.presentToast('Erreur lors du chargement des workflows', 'danger');
          loading.dismiss();
        }
      });
  }

  private loadTemplates() {
    this.workflowConfigService.getWorkflowTemplates(this.restaurantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (templates) => {
          this.templates = templates;
        },
        error: (error) => {
          console.error('Error loading templates:', error);
          this.presentToast('Erreur lors du chargement des modèles', 'danger');
        }
      });
  }

  async onSelectWorkflow(workflow: WorkflowDefinition) {
    this.selectedWorkflow = workflow;
    
    const loading = await this.loadingController.create({
      message: 'Chargement des étapes...'
    });
    await loading.present();

    this.workflowConfigService.getWorkflowSteps(workflow.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (steps) => {
          this.workflowSteps = steps;
          loading.dismiss();
        },
        error: (error) => {
          console.error('Error loading workflow steps:', error);
          this.presentToast('Erreur lors du chargement des étapes', 'danger');
          loading.dismiss();
        }
      });
  }

  async onToggleWorkflowStatus(workflow: WorkflowDefinition) {
    const alert = await this.alertController.create({
      header: 'Changer le statut',
      message: `Voulez-vous ${workflow.is_active ? 'désactiver' : 'activer'} le workflow "${workflow.name}" ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Confirmer',
          handler: () => {
            const newStatus = !workflow.is_active;
            
            this.workflowConfigService.updateWorkflowStatus(workflow.id, newStatus)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  workflow.is_active = newStatus;
                  this.presentToast(
                    `Workflow ${newStatus ? 'activé' : 'désactivé'}`, 
                    newStatus ? 'success' : 'warning'
                  );
                },
                error: (error) => {
                  console.error('Error updating workflow status:', error);
                  this.presentToast('Erreur lors de la mise à jour du statut', 'danger');
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  async onCreateWorkflow() {
    const alert = await this.alertController.create({
      header: 'Nouveau Workflow',
      inputs: [
        {
          name: 'workflowId',
          type: 'text',
          placeholder: 'ID du workflow (ex: order_process)',
          attributes: {
            required: true
          }
        },
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nom du workflow',
          attributes: {
            required: true
          }
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Description du workflow'
        },
        {
          name: 'maxDuration',
          type: 'number',
          placeholder: 'Durée maximale (minutes)',
          value: '30'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Créer',
          handler: (data) => {
            if (data.workflowId && data.name) {
              const newWorkflow: Omit<WorkflowDefinition, 'id' | 'created_at' | 'updated_at'> = {
                restaurant_id: this.restaurantId,
                workflow_id: data.workflowId,
                name: data.name,
                description: data.description || '',
                trigger_conditions: [],
                steps: [],
                max_duration_minutes: parseInt(data.maxDuration) || 30,
                is_active: true
              };

              this.workflowConfigService.createWorkflowDefinition(newWorkflow)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: (workflow) => {
                    this.workflows.unshift(workflow);
                    this.presentToast('Workflow créé avec succès', 'success');
                  },
                  error: (error) => {
                    console.error('Error creating workflow:', error);
                    this.presentToast('Erreur lors de la création du workflow', 'danger');
                  }
                });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async onCloneWorkflow(workflow: WorkflowDefinition) {
    const alert = await this.alertController.create({
      header: 'Cloner le Workflow',
      message: `Cloner le workflow: ${workflow.name}`,
      inputs: [
        {
          name: 'newName',
          type: 'text',
          placeholder: 'Nouveau nom',
          value: `${workflow.name} (copie)`
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Cloner',
          handler: (data) => {
            if (data.newName) {
              this.workflowConfigService.cloneWorkflow(workflow.id, data.newName)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: (clonedWorkflow) => {
                    this.workflows.unshift(clonedWorkflow);
                    this.presentToast('Workflow cloné avec succès', 'success');
                  },
                  error: (error) => {
                    console.error('Error cloning workflow:', error);
                    this.presentToast('Erreur lors du clonage du workflow', 'danger');
                  }
                });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async onTestWorkflow(workflow: WorkflowDefinition) {
    const alert = await this.alertController.create({
      header: 'Tester le Workflow',
      message: `Tester le workflow: ${workflow.name}`,
      inputs: [
        {
          name: 'testData',
          type: 'textarea',
          placeholder: 'Données de test (JSON)',
          value: '{"user_input": "test"}'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Tester',
          handler: (data) => {
            try {
              const testData = JSON.parse(data.testData || '{}');
              
              this.workflowConfigService.testWorkflow(workflow.id, testData)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: (result) => {
                    const message = result.success ? 'Test réussi' : 'Test échoué';
                    const color = result.success ? 'success' : 'danger';
                    this.presentToast(message, color);
                  },
                  error: (error) => {
                    console.error('Error testing workflow:', error);
                    this.presentToast('Erreur lors du test du workflow', 'danger');
                  }
                });
            } catch (error) {
              this.presentToast('Format JSON invalide', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async onValidateWorkflow(workflow: WorkflowDefinition) {
    const loading = await this.loadingController.create({
      message: 'Validation en cours...'
    });
    await loading.present();

    this.workflowConfigService.validateWorkflowConfiguration(workflow.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (validation) => {
          loading.dismiss();
          
          const alert = this.alertController.create({
            header: 'Résultat de la validation',
            message: validation.isValid 
              ? 'Le workflow est valide ✅' 
              : `Erreurs trouvées ❌<br><br>${validation.errors.join('<br>')}`,
            buttons: ['OK']
          });
          
          alert.then(a => a.present());
        },
        error: (error) => {
          loading.dismiss();
          console.error('Error validating workflow:', error);
          this.presentToast('Erreur lors de la validation', 'danger');
        }
      });
  }

  async onDeleteWorkflow(workflow: WorkflowDefinition) {
    const alert = await this.alertController.create({
      header: 'Supprimer le Workflow',
      message: `Êtes-vous sûr de vouloir supprimer le workflow "${workflow.name}" ? Cette action est irréversible.`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            this.workflowConfigService.deleteWorkflowDefinition(workflow.id)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.workflows = this.workflows.filter(w => w.id !== workflow.id);
                  if (this.selectedWorkflow?.id === workflow.id) {
                    this.selectedWorkflow = null;
                    this.workflowSteps = [];
                  }
                  this.presentToast('Workflow supprimé', 'success');
                },
                error: (error) => {
                  console.error('Error deleting workflow:', error);
                  this.presentToast('Erreur lors de la suppression', 'danger');
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  onDeselectWorkflow() {
    this.selectedWorkflow = null;
    this.workflowSteps = [];
  }

  getStepTypeLabel(stepType: string): string {
    const labels: { [key: string]: string } = {
      'PRODUCT_SELECTION': 'Sélection Produit',
      'QUANTITY_INPUT': 'Saisie Quantité',
      'MULTIPLE_CHOICE': 'Choix Multiple',
      'TEXT_INPUT': 'Saisie Texte',
      'VALIDATION': 'Validation',
      'SUMMARY': 'Résumé'
    };
    return labels[stepType] || stepType;
  }

  getStepTypeColor(stepType: string): string {
    const colors: { [key: string]: string } = {
      'PRODUCT_SELECTION': 'primary',
      'QUANTITY_INPUT': 'secondary',
      'MULTIPLE_CHOICE': 'tertiary',
      'TEXT_INPUT': 'success',
      'VALIDATION': 'warning',
      'SUMMARY': 'danger'
    };
    return colors[stepType] || 'medium';
  }

  private async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 3000,
      position: 'top'
    });
    await toast.present();
  }
}