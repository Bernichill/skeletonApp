import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChecklistPage } from './checklist.page';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import 'jasmine';

describe('ChecklistPage', () => {
  let component: ChecklistPage;
  let fixture: ComponentFixture<ChecklistPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ChecklistPage ],
      imports: [
        HttpClientModule,
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
        BrowserAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChecklistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
