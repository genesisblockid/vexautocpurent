const { Api, JsonRpc, RpcError } = require('vexaniumjs');
const { JsSignatureProvider } = require('vexaniumjs/dist/vexjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util');  
const rpc = new JsonRpc('https://explorer.vexanium.com:6960', { fetch });
const schedule = require('node-schedule');

const defaultPrivateKey = "5jb7234hkdsf......"; // cpu charger private key
const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

const minimumcpu = 1000
var acc = "account" //cpu receiver

    // get Cpu Available
   function getCpu(){
    rpc.get_account(acc).then((res) => {
       const avail = res.cpu_limit.available;
       console.log(avail)
       if (avail < minimumcpu){
        getBalancerex();
       }
       else{
        console.log("have cpu")
       }
    }
    ) 
    }

    //get balance deposited on rex
        function getBalancerex(){
            rpc.get_table_rows({
            code: "vexcore",
            json: true,
            limit: 1,
            lower_bound: "account", //account cpu charger
            scope: "vexcore",
            table: "rexfund",
            table_key: "",
            upper_bound: "account" //account cpu charger
            }).then((bal) => {
                const balance = bal.rows[0].balance ? bal.rows[0].balance.split(" ")[0] : 0;
                const bals = Number(balance).toFixed(0)
                console.log(bals)
                if(bals < 8)
                {
                    deposite();
                }
                else
                {
                    rentCpu();
                }
            });
          }

        //   function deposite
        function deposite(){
            api.transact({
              actions: [{
                account: 'vexcore',
                name: 'deposit',
                authorization: [{
                  actor: 'account', //account cpu charger
                  permission: 'active',
                }],
                data: {
                  amount: "10.0000 VEX",
                  owner: "account" //account cpu charger
                },
              }]
            }, {
              blocksBehind: 3,
              expireSeconds: 30,
            }).then((res) => {
                console.log(res)
                rentCpu();
            });
          }



//     // rent cpu
        function rentCpu(){
             api.transact({
              actions: [{
                account: 'vexcore',
                name: 'rentcpu',
                authorization: [{
                  actor: 'account', //account cpu charger
                  permission: 'active',
                }],
                data: {
                  from: 'account', //account cpu charger
                  receiver: acc,
                  loan_payment: '1.0000 VEX',
                  loan_fund: '0.0000 VEX',
                },
              }]
            }, {
              blocksBehind: 3,
              expireSeconds: 30,
            }).then((res) => {
                console.log(res)
            });    
          }

    getCpu();
    setInterval(getCpu,60000);//120s 一次 60秒检查一次

// code by yuda adi pratama

