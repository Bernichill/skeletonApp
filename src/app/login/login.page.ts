import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  credentials ={
    username: '',
    password: ''
  };

  ngOnInit() {
  }
  constructor(private navCtrl: NavController){}

  onSubmit(){
    if (this.credentials.username && this.credentials.password){
      
      this.navCtrl.navigateForward(['/home'], {
        queryParams: { 
          username: this.credentials.username,
        }
    });
  }
}

}