import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { WalletInfo } from '../model/walletinfo';
import { Error } from '../model/error';
import { SendTXArgs } from '../model/sender';
import { Observable, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RpcClient } from 'jsonrpc-ts';

@Injectable()
export class WalletService {
  private wallet_owner_api_url = 'http://localhost:13420/v2/owner'
  private send_url = 'http://localhost:3420/v1/wallet/owner/issue_send_tx';

  isUpdatingEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  totalFailureEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  showSenderEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  walletErrorEmitter: EventEmitter<Error> = new EventEmitter<Error>();

  currentNodeHeight: number;
  client: RpcClient;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.currentNodeHeight = 0;
    this.client = new RpcClient({ url: this.wallet_owner_api_url });
  }

  showSender(): void {
    this.showSenderEmitter.emit(true);
  }

  /**
   * Refresh the height from the wallet's preferred node
   * Should be run fairly frequently to let user know when
   * to update
   */

  refreshHeight(): void {
    this.client.makeRequest({
      jsonrpc: '2.0',
      method: 'node_height',
      params: null,
      id: 1,
    }).then(
      response => {
        this.totalFailureEmitter.emit(false);
        if (response.data.error) {
          //TODO
          console.log("an error happened");
        } else {
          // TODO CHECK if refreshed from node
          if (response.data.result['Ok']['height']) {
            this.currentNodeHeight = response.data.result['Ok']['height'];
          }
        }
      })
      .catch(error => {
        this.totalFailureEmitter.emit(true);
      });
  }

  /**
   * Refresh all wallet info against the preferred node
   * Can potentially take a while, so user should be blocked
   * while this is happening
   */

  refreshWalletFromNode(): void {
    this.isUpdatingEmitter.emit(true);
    // just do a wallet info with with a refresh, ignore the result
    this.client.makeRequest({
      jsonrpc: '2.0',
      method: 'retrieve_summary_info',
      params: [true, 1],
      id: 1,
    }).then(
      response => {
        var data = response.data;
        if (data.error) {
          // TODO
          console.log(data.error)
        } else {
          if (!data.result['Ok'][0]) {
            // TODO
            console.log("Not refreshed from node");
          } else {
            var info: WalletInfo = data.result['Ok'][1];
            if (info.last_confirmed_height > this.currentNodeHeight) {
              this.currentNodeHeight = info.last_confirmed_height;
            }
            this.router.navigate(this.route.snapshot.url);
            this.isUpdatingEmitter.emit(false);
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  /**
   * Rest-y type functions
   */

  getOutputs(show_spent: boolean, tx_id: number): Promise<any> {
    console.log('Calling Output ' + tx_id);
    return this.client.makeRequest({
      jsonrpc: '2.0',
      method: 'retrieve_outputs',
      params: [show_spent, true, tx_id],
      id: 1,
    });
  }

  getTxLog(id: number): Promise<any> {
    return this.client.makeRequest({
      jsonrpc: '2.0',
      method: 'retrieve_txs',
      params: [true, id, null],
      id: 1,
    });
  }

  getTxLogs(): Promise<any> {
    return this.client.makeRequest({
      jsonrpc: '2.0',
      method: 'retrieve_txs',
      params: [true, null, null],
      id: 1,
    });
  }

  getWalletInfo(): Promise<any> {
    return this.client.makeRequest({
      jsonrpc: '2.0',
      method: 'retrieve_summary_info',
      params: [true, 1],
      id: 1,
    });
  }

  postSend(args: SendTXArgs): void {
    console.log('Posting - ' + this.send_url);
    console.dir(args);
    this.http.post(this.send_url, args)
      .subscribe((res) => {
        this.walletErrorEmitter.emit({
          type: 'success',
          message: 'Ok'
        });
      }, error => {
        this.walletErrorEmitter.emit({
          type: 'sender',
          message: error.error,
        });
      });
  }


  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a message with the MessageService */
  private log(message: string) {
    console.log('WalletService: ' + message);
  }
}

