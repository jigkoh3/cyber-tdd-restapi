var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://172.19.192.116:9080');
var msisdn = "0957730669";

//http://172.19.192.116:9080/aftersales/tmv/migrateposttopre/validatemigrateposttopre?msisdn=0957730500
describe('TDD Cancel Normal Flow (' + msisdn + ')', function() {




    //Data input for submit
    //properties
    // + saleAgent : object
    // + orderData : object
    // + customerProfile : object
    // + productDetails : object
    // + customerAddress : object
    // + propositionSelected : object
    // + priceplanSelected : object
    var payload = {};

    //Data collection from dropdown list & modal selector list
    //properties
    // + propositions : collection of object
    // + priceplans : collection of object
    // + titles : collection of object (but I don't have get service in this sernario)
    // + resons : collection of object (but I don't have get service in this sernario)
    var collectionData = {};

    //Execute first on page load
    it('get SSO Authen Header', function(done) {
        var saleAgent = {
            "shopType": "0",
            "isSecondAuthen": true,
            "isCorporate": true,
            "channel": "WEBUI",
            "partnerCodes": ['80000084'],
            "partnerName": "xxxx",
            "partnerType": "XX",
            "saleCode": "00",
            "thaiName": "THAINAME",
            "engName": "ENGNAME",
            "shopcodes": ["80000084"],
            "logInName": "userTSM39"
        };
        expect(saleAgent.logInName).to.not.equal("");

        payload.saleAgent = saleAgent;
        done();
    });

    //Execute after getAuthen Success
    it('Generate OrderId', function(done) {
        //Assign partner_code from saleAgent
        var partner_code = payload.saleAgent.partnerCodes[0];

        var genIdTarget = '/aftersales/order/generate-id?channel=WEBUI&dealer=' + partner_code;
        api.get(genIdTarget)
            .set('Accept', 'application/json;charset=utf-8')
            .expect(200)
            .end(function(err, res) {

                expect(res.body).to.have.property("status");
                //Expect response-data
                expect(res.body).to.have.property("response-data");

                //Assign response-data to orderData
                payload.orderData = {
                    "TrxID": res.body["trx-id"],
                    "orderId": res.body["response-data"]
                }
                expect(res.body).to.not.have.property("display-messages");
                done();
            })
    });

    //Execute after generate-id Success
    it('validatecancel', function(done) {
        var validateTarget = '/aftersales/tmv/cancel/validatecancel?msisdn=' + msisdn;

        api.get(validateTarget)
            .set('roles', 'CN=R-TSM-IT FRIENDS,OU=Group,DC=ssoaddv,DC=th|CN=R-TSM-RETENTION,OU=Group,DC=ssoaddv,DC=th|CN=R-TSM-RR SERVICES,OU=Group,DC=ssoaddv,DC=th|CN=R-TSM-AFTER SALES DEVICES,OU=Group,DC=ssoaddv,DC=th|CN=R-TSM-RR SALES,OU=Group,DC=ssoaddv,DC=th')
            .set('Accept', 'application/json;charset=utf-8')
            .expect(200)
            .end(function(err, res) {
                console.log(res.body);
                expect(res.body).to.have.property("status");
                //Expect response-data is not null and contrain property customer
                expect(res.body).to.have.property("response-data");

                done();
            })
    });

    //Execute after click confirm button
    it('submit', function(done) {

        var submitTarget = "/aftersales/order/submit";
        var request = {
            "order": {
                "order-id": payload.orderData.orderId,
                "creator": payload.saleAgent.logInName,
                //"create-date": "",
                "customer": {
                    'title-code': payload.customerProfile['title-code'],
                    'title': payload.customerProfile['title'],
                    'firstname': payload.customerProfile['firstname'],
                    'lastname': payload.customerProfile['lastname'],
                    //'gender': null,
                    'id-type': payload.customerProfile['id-type'],
                    'id-number': payload.customerProfile['id-number'],
                    'birthdate': payload.customerProfile['birthdate'],
                    'id-expire-date': payload.customerProfile['id-expire-date'],
                    'contact-number': payload.customerProfile['contact-number'],
                    'contact-mobile-number': payload.customerProfile['contact-mobile-number'],
                    //"contact-email": "chitchai@cmail.com",
                    // "language": payload.customerProfile['language'],
                    //"branch-code": null,
                    //"tax-id": null,
                    "customer-id": payload.customerProfile['customer-id'],
                    // "customer-level": payload.customerProfile['customer-level'],
                    // "customer_sublevel_id": payload.customerProfile['customer_sublevel_id'],
                    // "customer_sublevel": payload.customerProfile['customer_sublevel'],
                    ////////////////////////////////////////////////
                    "address-list": {
                        "CUSTOMER_ADDRESS": payload.customerAddress
                    },
                    // "customer-agents": {
                    //     "AUTH_1": {
                    //         "contact": "0868836665",
                    //         "id-number": "9988877688845",
                    //         "id-type": "I",
                    //         "firstname": "สมคิด",
                    //         "lastname": "คิดมากไป",
                    //         "birthdate": "2015-07-20T00:00:00+0700"
                    //     },
                    //     "POA": {
                    //         "contact": "0868836664",
                    //         "id-number": "3257588733945",
                    //         "id-type": "I",
                    //         "firstname": "สมชาย",
                    //         "lastname": "ปากสว่าง",
                    //         "birthdate": "2015-07-20T00:00:00+0700"
                    //     },
                    //     "AUTH_2": {
                    //         "contact": "0868836666",
                    //         "id-number": "9988877687723",
                    //         "id-type": "I",
                    //         "firstname": "สมฤดี",
                    //         "lastname": "ดีเกินไป",
                    //         "birthdate": "2015-07-20T00:00:00+0700"
                    //     }
                    // }
                },
                "sale-agent": {
                    'name': payload.saleAgent['engName'],
                    'channel': payload.saleAgent['channel'],
                    'partner-code': (payload.saleAgent["partnerCodes"].length > 0 ? payload.saleAgent["partnerCodes"][0] : null),
                    'partner-name': payload.saleAgent['partnerName'],
                    'sale-code': payload.saleAgent['saleCode'],
                    //'sale-assist-code': "",
                    'partner-type': payload.saleAgent['partnerType']
                },
                "order-items": [{
                    "name": "CANCEL",
                    "product-name": payload.priceplanSelected["name"],
                    "product-id-number": payload.productDetails['product-id-number'],
                    "product-id-name": payload.productDetails['product-id-name'],
                    "user-memo": "Customer want to request",
                    "order-data": {
                        "MOBILE-SERVICETYPE": "",
                        "SERVICE-LEVEL": "C",
                        "SUBSCRIBER-ID": ""
                    },
                    "primary-order-data": {
                        "OU-ID": payload.productDetails['ouId'],
                        "BAN": payload.productDetails['ban'],
                        "ACCOUNT-CATEGORY": payload.productDetails['account-category'],
                        "ACCOUNT-SUB-TYPE": payload.productDetails['account-sub-type'],
                        "COMPANY-CODE": payload.productDetails['company-code'],
                        "EFFECTIVE-OPTION": "IMMEDIATE",
                        "EFFECTIVE-DATE": "12/12/2015"
                            //"SIM": null
                    },
                    "product-category": "TMV",
                    "product-type": "PRICEPLAN",
                    "order-type": "CHANGE"
                }],
                "last-modify-date": ""
            },
            'ref-id': payload.orderData.TrxID,
            'user-id': payload.saleAgent.logInName,
            'approver': "",
        };
        api.post(submitTarget)
            .set('Accept', 'application/json;charset=utf-8')
            .send(request)
            .expect(200)
            .end(function(err, res) {
                console.log(request.order['order-items'][0]);
                console.log(res.body);
                //status
                expect(res.body).to.have.property("status");
                expect(res.body.status).to.equal("SUCCESSFUL");
                done();
            })
    });


});