var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://172.19.192.116:9080');

//http://172.19.192.116:9080/aftersales/tmv/migrateposttopre/validatemigrateposttopre?msisdn=0957730500
describe('TDD Migrate PostToPre Normal Flow (' + msisdn + ')', function() {

    var msisdn = "0957570002";


    //Data input for submit
    //properties
    // + saleAgent : object
    // + orderData : object
    // + customerProfile : object
    // + productDetails : object
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
        }
        expect(saleAgent.logInName).to.not.equal("");

        payload.saleAgent = saleAgent;
    });

    //Execute after getAuthen Success
    it('Generate OrderId', function(done) {
        //Assign partner_code from saleAgent
        var partner_code = payload.saleAgent.partner_code[0];

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
    it('validatemigrateposttopre', function(done) {

        var validateTarget = '/aftersales/tmv/migrateposttopre/validatemigrateposttopre?msisdn=' + msisdn;

        api.get(validateTarget)
            .set('roles', 'CN=R-TSM-IT FRIENDS,OU=Group,DC=ssoaddv,DC=th|CN=R-TSM-RETENTION,OU=Group,DC=ssoaddv,DC=th|CN=R-TSM-RR SERVICES,OU=Group,DC=ssoaddv,DC=th|CN=R-TSM-AFTER SALES DEVICES,OU=Group,DC=ssoaddv,DC=th|CN=R-TSM-RR SALES,OU=Group,DC=ssoaddv,DC=th')
            .set('Accept', 'application/json;charset=utf-8')
            .expect(200)
            .end(function(err, res) {

                expect(res.body).to.have.property("status");
                //Expect response-data is not null and contrain property customer
                expect(res.body).to.have.property("response-data");
                expect(res.body["response-data"]).to.have.property("customer");
                //Expect customer contrain installed-product collection
                expect(res.body["response-data"]["customer"]).to.have.property("installed-products");
                expect(res.body["response-data"]["customer"]["installed-products"].length).to.above(0);
                //Assign customer to customerProfile for scope
                payload.customerProfile = res.body["response-data"]["customer"];
                payload.productDetails = utils.getObject(customerProfile, 'installed-products.0');
                delete payload.customerProfile['installed-products'];
                //Expect display-messages colection length == 0
                expect(res.body).to.have.property("display-messages");
                expect(res.body["display-messages"].length).to.equal(0);
                done();
            })
    });
    
    //Execute After validatemigrateposttopre Success only
    it('proposition', function(done) {
        //Asign input data for service API [proposition]

        var company_code = payload.productDetails["company-code"]; //from validate
        var customer_type = payload.productDetails["account-category"]; // from validate
        var customer_subtype = payload.productDetails["account-sub-type"]; // from validate
        var mobile_servicetype = payload.productDetails["mobile-servicetype"]; // from validate
        var propo_type = "NEW"; //??????
        var partner_code = payload.saleAgent.partner_code[0];
        var privilege = "false"; //?????

        var propositionTarget = '/sales/catalog/product/tmv/proposition/search?company-code=' + company_code + '&customer-type=' + customer_type + '&propo-type=' + propo_type + '&mobile-servicetype=' + mobile_servicetype + '&partner-code=' + partner_code + '&privilege=' + privilege;
        api.get(propositionTarget)
            .set('Accept', 'application/json;charset=utf-8')
            .expect(200)
            .end(function(err, res) {

                expect(res.body).to.have.property("status");
                expect(res.body).to.have.property("response-data");
                expect(res.body["response-data"].length).to.above(0);

                expect(res.body["response-data"][0]).to.have.property('service-level');
                expect(res.body["response-data"][0]).to.have.property('proposition-code');

                //Assign response-data to dropdown propositions
                collectionData.propositions = res.body["response-data"];

                
                //display-messages
                expect(res.body).to.not.have.property("display-messages");

                done();
            })
    });

    //Execute After selected Proposition list
    it('priceplan', function(done) {

        var company_code = payload.productDetails["company-code"]; //from validate
        var customer_type = payload.productDetails["account-category"]; // from validate
        var customer_subtype = payload.productDetails["account-sub-type"]; // from validate
        var mobile_servicetype = payload.productDetails["mobile-servicetype"]; // from validate
        var propo_type = "NEW"; //??????
        var partner_code = payload.saleAgent.partner_code[0]; //from login sso
        var privilege = "false"; //?????

        //receipt input proposition data from user
        payload.propositionSelected = collectionData.propositions[0];
        
        var service_level = payload.propositionSelected['service-level']; // user selected proppo dropdown
        var proposition = payload.propositionSelected['proposition-code']; // user selected proppo dropdown
        var propositionName = payload.propositionSelected['name']; // user selected proppo dropdown

        var propositionTarget = '/sales/catalog/product/tmv/priceplan/search?company-code=' + company_code + '&customer-type=' + customer_type + '&customer-subtype=' + customer_subtype + '&service-level=' + service_level + '&proposition=' + proposition + '&partner-code=' + partner_code + '&privilege=' + privilege;
        //console.log(propositionTarget);
        api.get(propositionTarget)
            .set('Accept', 'application/json;charset=utf-8')
            .expect(200)
            .end(function(err, res) {
                
                expect(res.body).to.have.property("status");
                expect(res.body).to.have.property("response-data");
                expect(res.body["response-data"].length).to.above(0);

                //Assign response-data to modal selector list priceplan
                collectionData.priceplans = res.body["response-data"];

                //display-messages
                expect(res.body).to.not.have.property("display-messages");
                
                done();
            })
    });
    
    //Execute input & click print button
    it('vilidate input form', function(done) {

        payload.priceplanSelected = collectionData.priceplans[0];

        payload.customerProfile['title-code']="T1";
        payload.customerProfile['firstname']="ทดสอบ";
        payload.customerProfile['lastname']="ชอบเติมเงิน";
        payload.customerProfile['id-type'] = "I";
        payload.customerProfile['id-number']="3290200886926";
        payload.customerProfile['birthdate']="1991-07-20T00:00:00+0700";
        payload.customerProfile['id-expire-date']="2016-07-20T00:00:00+0700";
        payload.customerProfile['language'] = "TH";

        //Fix value becuase migrate post to pre support personal only
        payload.productDetails['account-category'] = "P";
        payload.productDetails['account-sub-type'] = "PRE";

        //follow validate fields under this comment
        expect(payload.propositionSelected).to.have.property("name");
        expect(payload.propositionSelected).to.have.property("proposition-code");

        expect(payload.priceplanSelected).to.have.property("name");
        
        expect(payload.customerProfile).to.have.property("title-code");
        expect(payload.customerProfile['title-code']).to.not.equal("");

        expect(payload.customerProfile).to.have.property("firstname");
        expect(payload.customerProfile['firstname']).to.not.equal("");

        expect(payload.customerProfile).to.have.property("lastname");
        expect(payload.customerProfile['lastname']).to.not.equal("");
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
                    "language": payload.customerProfile['language'],
                    //"branch-code": null,
                    //"tax-id": null,
                    "customer-id": payload.customerProfile['customer-id'],
                    // "customer-level": payload.customerProfile['customer-level'],
                    // "customer_sublevel_id": payload.customerProfile['customer_sublevel_id'],
                    // "customer_sublevel": payload.customerProfile['customer_sublevel'],
                    ////////////////////////////////////////////////
                    //"address-list": payload.customerProfile['address-list'],
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
                    "name": "MIGRATE_POST_TO_PRE",
                    "product-name": payload.priceplanSelected["name"], 
                    "product-id-number": payload.productDetails['product-id-number'],
                    "product-id-name": payload.productDetails['product-id-name'],
                    "product-category": payload.productDetails['product-category'],
                    "product-type": payload.productDetails['product-type'],
                    "order-type": "CHANGE",
                    "reason-code": "AA02",
                    //"user-memo": "Customer want to request .",
                    "address-list": {
                        "BILLING_ADDRESS": {
                            "number": "61/268",
                            "moo": "8",
                            "village": "moo ban",
                            "street": "ratchada",
                            "soi": "8",
                            "district": "dindaeng",
                            "province": "Pathumthani",
                            "building-name": "Pakin",
                            "building-room": "22",
                            "building-floor": "13",
                            "sub-district": "Dindaeng",
                            "zip": "22222",
                            "household": "18"
                        },
                        "TAX_ADDRESS": {
                            "number": "61/268",
                            "moo": "8",
                            "village": "moo ban",
                            "street": "ratchada",
                            "soi": "8",
                            "district": "dindaeng",
                            "province": "Pathumthani",
                            "building-name": "Pakin",
                            "building-room": "22",
                            "building-floor": "13",
                            "sub-district": "Dindaeng",
                            "zip": "22222",
                            "household": "18"
                        }
                    },
                    // "order-data": {
                    //     "IMSI": null,
                    //     "MAXALLOW-APPROVE-CODE": null,
                    //     "MOBILE-SERVICETYPE": null,
                    //     "OFFERS-REQUIRE-PARAMETER": "CUG",
                    //     $ {
                    //         "OFFERS-REQUIRE-PARAMETER"
                    //     } - PARAM - SIZE " : "
                    //     2 ",
                    //     $ {
                    //         "OFFERS-REQUIRE-PARAMETER"
                    //     } - PARAM - $ {
                    //         SIZE
                    //     }
                    //     " : "
                    //     NAME | VALUE | UNIT ",
                    //     "SUBSCRIBER-TITLE-CODE": null,
                    //     "SUBSCRIBER-TITLE": null,
                    //     "SUBSCRIBER-FIRSTNAME": null,
                    //     "SUBSCRIBER-LASTNAME": null,
                    //     "SUBSCRIBER-BIRTHDATE": null,
                    //     "SUBSCRIBER-GENDER": null,
                    //     "SUBSCRIBER-SMS-LANG": null,
                    //     "ACCOUNT-BILL-FORMAT": null,
                    //     "ACCOUNT-EMAIL": null,
                    //     "ACCOUNT-SMS-NUMBER": null,
                    //     "ACCOUNT-PAYMENT-METHOD": null,
                    //     "ACCOUNT-LANG": null,
                    //     "ACCOUNT-BILL-CYCLE": null,
                    // },
                    "primary-order-data": {
                        "OU-ID": payload.productDetails['ouId'],
                        "BAN": payload.productDetails['ban'],
                        "ACCOUNT-CATEGORY": payload.productDetails['account-category'],
                        "ACCOUNT-SUB-TYPE": payload.productDetails['account-sub-type'],
                        "COMPANY-CODE": payload.productDetails['company-code'],
                        "NAS-PROPOSITION": payload.propositionSelected['proposition-code'],
                        "CCBS-PROPOSITION": payload.propositionSelected['name']
                            //"SIM": null
                    }
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