import { Component, Input, OnInit } from '@angular/core';
import { WalletService } from '../../../services/wallet.service';
import { SendTXArgs } from '../../../model/sender';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { UtilService } from '../../../services/util.service';

@Component({
  selector: 'app-sender',
  template: ``,
})
export class SenderComponent implements OnInit {
  constructor(private modalService: NgbModal, private walletService: WalletService) {
  }

  ngOnInit() {
    let modalRef = null;
    this.walletService.showSenderEmitter.subscribe(
      (value) => {
        if (value) {
          modalRef = this.modalService.open(SenderContentComponent, {
            backdrop: 'static',
            keyboard: false,
            centered: true,
            size: 'lg',
          });
        } else {
          if (modalRef) {
            modalRef.close();
          }
        }
      }
    );
  }
}

@Component({
  selector: 'app-sender-content',
  templateUrl: 'sender.component.html',
})
export class SenderContentComponent implements OnInit {
  txSendArgs = new SendTXArgs;
  fluff = true
  show_error = false;

  constructor(public activeModal: NgbActiveModal,
    private walletService: WalletService,
    private util: UtilService) {
  }

  ngOnInit() {
    this.walletService.walletErrorEmitter.subscribe(
      (error) => {
        console.log(error.message);
        this.show_error = true;
      });
  }

  postSend(): void {
    let sending = Object.assign({}, this.txSendArgs);
    sending.amount = this.util.hrToAmount(sending.amount);
    this.walletService.postSend(sending, this.fluff);

  }
}

@Component({
  selector: 'app-send-alert',
  templateUrl: './sender.alert.html'
})
export class SenderAlertComponent implements OnInit {
  private _success = new Subject<string>();

  show_error = false;
  show_success = false;
  errorMessage: string;

  constructor(private walletService: WalletService) {
  }

  ngOnInit(): void {

    this.walletService.walletErrorEmitter.subscribe(
      (error) => {
        console.log(error.message);
        if (error.type === 'success') {
          this.show_error = false;
          this.show_success = true;

        } else {
          this.show_success = false;
          this.show_error = true;
        }
        this.errorMessage = error.message;
      });
  }

  public changeSuccessMessage() {
    this._success.next(`${new Date()} - Message successfully changed.`);
  }
}
