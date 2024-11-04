import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.page.html',
  styleUrls: ['./checklist.page.scss'],
})
export class ChecklistPage implements OnInit {

  constructor() { }

  ngOnInit() { }

  selectedPatente: string = '';

  patentes = [
    'AA-1234',
    'BB-5678',
    'CC-9101',
    'DD-2345',
    'EE-6789',
  ];

  bocinaStatus: string = '';
  bocinaComments: string = '';

  aireAcondicionadoStatus: string = '';
  aireAcondicionadoComments: string = '';

  neumaticoRepuestoStatus: string = '';
  neumaticoRepuestoComments: string = '';

  airbagStatus: string = '';
  airbagComments: string = '';

  balizaStatus: string = '';
  balizaComments: string = '';

  radioStatus: string = '';
  radioComments: string = '';

  
  isSubmitting: boolean = false;
  onSubmit() {

    this.isSubmitting = true;


    setTimeout(() => {

      const checklistData = {
        patente: this.selectedPatente,
        bocina: { status: this.bocinaStatus, comments: this.bocinaComments },
        aireAcondicionado: { status: this.aireAcondicionadoStatus, comments: this.aireAcondicionadoComments },
        neumaticoRepuesto: { status: this.neumaticoRepuestoStatus, comments: this.neumaticoRepuestoComments },
        airbag: { status: this.airbagStatus, comments: this.airbagComments },
        baliza: { status: this.balizaStatus, comments: this.balizaComments },
        radio: { status: this.radioStatus, comments: this.radioComments },
      };
  
      // Almacenar datos en el historial en localStorage
      this.saveToLocalStorage(checklistData);
      alert('Checklist guardado exitosamente');
      this.resetFields();

      
      this.isSubmitting = false; 
    }, 3000); 

  }

  saveToLocalStorage(checklistData: any) {
    // Obtener el historial existente
    const historialGuardado = localStorage.getItem('historial');
    const historialArray = historialGuardado ? JSON.parse(historialGuardado) : [];
    // Agregar el nuevo checklist
    historialArray.push(checklistData);
    // Guardar el nuevo historial en localStorage
    localStorage.setItem('historial', JSON.stringify(historialArray));
  }

  resetFields() {
    this.selectedPatente = '';
    this.bocinaStatus = '';
    this.bocinaComments = '';
    this.aireAcondicionadoStatus = '';
    this.aireAcondicionadoComments = '';
    this.neumaticoRepuestoStatus = '';
    this.neumaticoRepuestoComments = '';
    this.airbagStatus = '';
    this.airbagComments = '';
    this.balizaStatus = '';
    this.balizaComments = '';
    this.radioStatus = '';
    this.radioComments = '';
  }

  cleanForm() {
    this.resetFields();
  }

  needsComments(status: string): boolean {
    return status === 'Malo';
  }
}
