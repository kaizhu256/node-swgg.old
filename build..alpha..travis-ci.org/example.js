



























































































/*
example.js

this script will run a standalone swagger-ui server backed by db-lite

instruction
    1. save this script as example.js
    2. run the shell command:
        $ npm install swgg && PORT=8081 node example.js
    3. play with the browser-demo on http://127.0.0.1:8081
*/



/* istanbul instrument in package swgg */
/*jslint
    bitwise: true,
    browser: true,
    maxerr: 8,
    maxlen: 96,
    node: true,
    nomen: true,
    regexp: true,
    stupid: true
*/
(function () {
    'use strict';
    var local;



    // run shared js-env code - pre-init
    (function () {
        // init local
        local = {};
        // init modeJs
        local.modeJs = (function () {
            try {
                return typeof navigator.userAgent === 'string' &&
                    typeof document.querySelector('body') === 'object' &&
                    typeof XMLHttpRequest.prototype.open === 'function' &&
                    'browser';
            } catch (errorCaughtBrowser) {
                return module.exports &&
                    typeof process.versions.node === 'string' &&
                    typeof require('http').createServer === 'function' &&
                    'node';
            }
        }());
        // init global
        local.global = local.modeJs === 'browser'
            ? window
            : global;
        // init utility2_rollup
        local = local.global.utility2_rollup || (local.modeJs === 'browser'
            ? local.global.swgg
            : require('swgg'));
        // export local
        local.global.local = local;
        // load db
        local.db.dbLoad(function () {
            console.log('db loaded from ' + local.storageDir);
        });
        local.middlewareCrudCustom = function (request, response, nextMiddleware) {
        /*
         * this function will run the middleware that will run custom-crud-operations
         */
            var crud, options, result;
            options = {};
            local.onNext(options, function (error, data) {
                switch (options.modeNext) {
                case 1:
                    crud = request.swgg.crud;
                    switch (crud.operationId.split('.')[0]) {
                    // coverage-hack - test error handling-behavior
                    case 'crudErrorPre':
                        options.onNext(local.errorDefault);
                        return;
                    case 'getInventory':
                        crud.dbTable.crudGetManyByQuery({
                            query: {},
                            projection: ['status']
                        }, options.onNext);
                        break;
                    default:
                        options.modeNext = Infinity;
                        options.onNext();
                    }
                    break;
                case 2:
                    switch (crud.operationId.split('.')[0]) {
                    case 'getInventory':
                        result = {};
                        data.forEach(function (element) {
                            result[element.status] = result[element.status] || 0;
                            result[element.status] += 1;
                        });
                        options.onNext(null, result);
                        break;
                    }
                    break;
                case 3:
                    local.swgg.serverRespondJsonapi(request, response, error, data);
                    break;
                default:
                    nextMiddleware(error, data);
                }
            });
            options.modeNext = 0;
            options.onNext();
        };
        local.middlewareInitCustom = function (request, response, nextMiddleware) {
        /*
         * this function will run the middleware that will custom-init the request and response
         */
            // enable cors
            // http://en.wikipedia.org/wiki/Cross-origin_resource_sharing
            response.setHeader(
                'Access-Control-Allow-Methods',
                'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'
            );
            response.setHeader('Access-Control-Allow-Origin', '*');
            // init content-type
            response.setHeader('Content-Type', 'application/json; charset=UTF-8');
            // ignore .map files
            if (request.urlParsed.pathname.slice(-4) === '.map') {
                local.serverRespondDefault(request, response, 404);
                return;
            }
            nextMiddleware();
        };
        // init middleware
        local.utility2._middleware = local.middlewareGroupCreate([
            local.middlewareInit,
            local.middlewareForwardProxy,
            local.middlewareAssetsCached,
            local.swgg.middlewareRouter,
            local.swgg.middlewareUserLogin,
            local.middlewareInitCustom,
            local.utility2._middlewareJsonpStateInit,
            local.middlewareBodyRead,
            local.swgg.middlewareBodyParse,
            local.swgg.middlewareValidate,
            local.middlewareCrudCustom,
            local.swgg.middlewareCrudBuiltin,
            local.swgg.middlewareCrudEnd
        ]);
        // run test-server
        local.testRunServer(local);
        // init petstore-api - frontend
        local.tmp = JSON.parse(local.assetsDict['/assets.swgg.petstore.json']);
        delete local.tmp.basePath;
        delete local.tmp.host;
        delete local.tmp.schemes;
        local.swgg.apiDictUpdate(local.tmp);
        // init petstore-api - backend
        local.swgg.apiDictUpdate({
            definitions: {
                File: {
                    allOf: [{ $ref: '#/definitions/BuiltinFile' }]
                },
                Pet: {
                    properties: {
                        _id: { readOnly: true, type: 'string' },
                        _timeCreated: { format: 'date-time', readOnly: true, type: 'string' },
                        _timeUpdated: { format: 'date-time', readOnly: true, type: 'string' },
                        id: { default: 1, minimum: 1 }
                    }
                },
                Order: {
                    properties: {
                        _id: { readOnly: true, type: 'string' },
                        _timeCreated: { format: 'date-time', readOnly: true, type: 'string' },
                        _timeUpdated: { format: 'date-time', readOnly: true, type: 'string' },
                        id: { default: 1, minimum: 1 }
                    }
                },
                User: {
                    allOf: [{ $ref: '#/definitions/BuiltinUser' }],
                    properties: {
                        _id: { readOnly: true, type: 'string' },
                        _timeCreated: { format: 'date-time', readOnly: true, type: 'string' },
                        _timeUpdated: { format: 'date-time', readOnly: true, type: 'string' },
                        email: { default: 'a@a.com', format: 'email' },
                        id: { default: 1, minimum: 1 }
                    }
                }
            },
            tags: [{ description: 'builtin-file model', name: 'file' }],
            'x-swgg-apiDict': {
                'file crudCountManyByQuery': {
                    _schemaName: 'File'
                },
                'file crudSetOneById.id.id': {
                    _schemaName: 'File'
                },
                'file crudGetManyByQuery': {
                    _schemaName: 'File'
                },
                'file crudRemoveOneById.id.id': {
                    _schemaName: 'File'
                },
                'file crudUpdateOneById.id.id': {
                    _schemaName: 'File'
                },
                'file fileGetOneById.id.id': {
                    _schemaName: 'File'
                },
                'file fileUploadManyByForm.1': {
                    _schemaName: 'File'
                },
                'pet addPet': {
                    _operationId: 'crudSetOneById.petId.id',
                    _schemaName: 'Pet'
                },
                'pet crudGetManyByQuery': {
                    _schemaName: 'Pet'
                },
                'pet deletePet': {
                    _operationId: 'crudRemoveOneById.petId.id',
                    _schemaName: 'Pet'
                },
                'pet findPetsByStatus': {
                    _operationId: 'crudGetManyByQuery',
                    _queryWhere: '{"status":{"$in":{{status jsonStringify}}}}',
                    _schemaName: 'Pet'
                },
                'pet findPetsByTags': {
                    _operationId: 'crudGetManyByQuery',
                    _queryWhere: '{"tags.name":{"$in":{{tags jsonStringify}}}}',
                    _schemaName: 'Pet'
                },
                'pet getPetById': {
                    _operationId: 'crudGetOneById.petId.id',
                    _schemaName: 'Pet'
                },
                'pet updatePet': {
                    _operationId: 'crudUpdateOneById.petId.id',
                    _schemaName: 'Pet'
                },
                'pet updatePetWithForm': {
                    _operationId: 'crudUpdateOneById.petId.id',
                    _schemaName: 'Pet'
                },
                'pet uploadFile': {
                    _operationId: 'fileUploadManyByForm',
                    _schemaName: 'User'
                },
                'store crudGetManyByQuery': {
                    _schemaName: 'Order'
                },
                'store crudUpdateOneById.id.id': {
                    _schemaName: 'Order'
                },
                'store deleteOrder': {
                    _operationId: 'crudRemoveOneById.orderId.id',
                    _schemaName: 'Order'
                },
                'store getInventory': {
                    _schemaName: 'Order'
                },
                'store getOrderById': {
                    _operationId: 'crudGetOneById.orderId.id',
                    _schemaName: 'Order'
                },
                'store placeOrder': {
                    _operationId: 'crudSetOneById.orderId.id',
                    _schemaName: 'Order'
                },
                'user createUser': {
                    _operationId: 'crudSetOneById.username.username',
                    _schemaName: 'User'
                },
                'user createUsersWithArrayInput': {
                    _operationId: 'crudSetManyById',
                    _schemaName: 'User'
                },
                'user createUsersWithListInput': {
                    _operationId: 'crudSetManyById',
                    _schemaName: 'User'
                },
                'user crudCountManyByQuery': {
                    _schemaName: 'User'
                },
                'user crudSetOneById.username.username': {
                    _schemaName: 'User'
                },
                'user crudRemoveOneById.username.username': {
                    _schemaName: 'User'
                },
                'user crudGetManyByQuery': {
                    _schemaName: 'User'
                },
                'user crudUpdateOneById.username.username': {
                    _schemaName: 'User'
                },
                'user deleteUser': {
                    _operationId: 'crudRemoveOneById.username.username',
                    _schemaName: 'User'
                },
                'user getUserByName': {
                    _operationId: 'crudGetOneById.username.username',
                    _schemaName: 'User'
                },
                'user loginUser': {
                    _operationId: 'userLoginByPassword',
                    _schemaName: 'User'
                },
                'user logoutUser': {
                    _operationId: 'userLogout',
                    _schemaName: 'User'
                },
                'user updateUser': {
                    _operationId: 'crudUpdateOneById.username.username',
                    _schemaName: 'User'
                },
                'user userLoginByPassword': {
                    _schemaName: 'User'
                },
                'user userLogout': {
                    _schemaName: 'User'
                }
            },
            'x-swgg-datatableDict': {
                file: {
                    crudSetOneById: 'file crudSetOneById.id.id',
                    crudRemoveOneById: 'file crudRemoveOneById.id.id',
                    crudGetManyByQuery: 'file crudGetManyByQuery',
                    schema: { $ref: '#/definitions/File' }
                },
                pet: {
                    crudSetOneById: 'pet addPet',
                    crudRemoveOneById: 'pet deletePet',
                    crudGetManyByQuery: 'pet crudGetManyByQuery',
                    schema: { $ref: '#/definitions/Pet' }
                },
                store: {
                    crudSetOneById: 'store placeOrder',
                    crudRemoveOneById: 'store deleteOrder',
                    crudGetManyByQuery: 'store crudGetManyByQuery',
                    schema: { $ref: '#/definitions/Order' }
                },
                user: {
                    crudSetOneById: 'user createUser',
                    crudRemoveOneById: 'user deleteUser',
                    crudGetManyByQuery: 'user crudGetManyByQuery',
                    schema: { $ref: '#/definitions/User' }
                }
            }
        });
        // init db
        local.dbSeedList = [{
            dbRowList: [{
                id: 'testCase_swaggerUiLogoSmall',
                fileBlob: local.swgg.templateSwaggerUiLogoSmallBase64,
                fileContentType: 'image/png',
                fileDescription: 'swagger-ui logo',
                fileFilename: 'swaggerUiLogoSmall.png'
            }],
            idIndexCreateList: [{
                name: 'id'
            }],
            name: 'File'
        }, {
            dbRowList: local.swgg.dbRowListRandomCreate({
                dbRowList: [{
                    id: 0,
                    name: 'birdie',
                    photoUrls: [],
                    status: 'available',
                    tags: [{ name: 'bird'}]
                }, {
                    id: 1,
                    name: 'doggie',
                    status: 'pending',
                    photoUrls: [],
                    tags: [{ name: 'dog'}]
                }, {
                    id: 2,
                    name: 'fishie',
                    photoUrls: [],
                    status: 'sold',
                    tags: [{ name: 'fish'}]
                }],
                // init 100 extra random pets
                length: 100,
                override: function (options) {
                    return {
                        id: options.ii + 100,
                        name: local.listGetElementRandom(
                            ['birdie', 'doggie', 'fishie']
                        ) + '-' + (options.ii + 100),
                        tags: [
                            { name: local.listGetElementRandom(['female', 'male']) }
                        ]
                    };
                },
                properties: local.swgg.swaggerJson.definitions.Pet.properties
            }),
            idIndexCreateList: [{
                isInteger: true,
                name: 'id'
            }],
            name: 'Pet'
        }, {
            dbRowList: local.swgg.dbRowListRandomCreate({
                dbRowList: [{
                    id: 0,
                    petId: 0,
                    status: 'available'
                }, {
                    id: 1,
                    petId: 1,
                    status: 'pending'
                }, {
                    id: 2,
                    petId: 2,
                    status: 'sold'
                }],
                // init 100 extra random orders
                length: 100,
                override: function (options) {
                    return {
                        id: options.ii + 100,
                        petId: options.ii + 100
                    };
                },
                properties: local.swgg.swaggerJson.definitions.Order.properties
            }),
            idIndexCreateList: [{
                isInteger: true,
                name: 'id'
            }],
            name: 'Order'
        }, {
            dbRowList: local.swgg.dbRowListRandomCreate({
                dbRowList: [{
                    email: 'admin@admin.com',
                    firstName: 'admin',
                    id: 0,
                    lastName: '',
                    password: local.sjclHashScryptCreate('secret'),
                    phone: '1234-5678',
                    username: 'admin'
                }, {
                    email: 'jane@doe.com',
                    firstName: 'jane',
                    id: 1,
                    lastName: 'doe',
                    password: local.sjclHashScryptCreate('secret'),
                    phone: '1234-5678',
                    username: 'jane.doe'
                }, {
                    email: 'john@doe.com',
                    firstName: 'john',
                    id: 2,
                    lastName: 'doe',
                    password: local.sjclHashScryptCreate('secret'),
                    phone: '1234-5678',
                    username: 'john.doe'
                }],
                // init 100 extra random users
                length: 100,
                override: function (options) {
                    return {
                        firstName: local.listGetElementRandom(
                            ['alice', 'bob', 'jane', 'john']
                        ) + '-' + (options.ii + 100),
                        id: options.ii + 100,
                        lastName: local.listGetElementRandom(['doe', 'smith']) +
                            '-' + (options.ii + 100),
                        password: local.sjclHashScryptCreate('secret'),
                        tags: [
                            { name: local.listGetElementRandom(['female', 'male']) },
                            { name: Math.random().toString(36).slice(2) }
                        ]
                    };
                },
                properties: local.swgg.swaggerJson.definitions.User.properties
            }),
            idIndexCreateList: [{
                name: 'email'
            }, {
                name: 'id',
                isInteger: true
            }, {
                name: 'username'
            }],
            name: 'User'
        }];
        local.dbReset = local.utility2._testRunBefore = function () {
            local.onResetBefore.counter += 1;
            local.db.dbDrop(local.onResetBefore);
            local.onResetAfter(function () {
                console.log('db seeding ...');
                local.onReadyBefore.counter += 1;
                local.db.dbTableCreateMany(local.dbSeedList, local.onReadyBefore);
                local.onReadyBefore.counter += 1;
                local.db.dbTableCreateMany(local.dbSeedTestList, local.onReadyBefore);
            });
        };
    }());
    switch (local.modeJs) {



    // run browser js-env code - post-init
    case 'browser':
        /* istanbul ignore next */
        local.testRun = function (event) {
            var reader, tmp;
            switch (event && event.currentTarget.id) {
            case 'dbExportButton1':
                tmp = window.URL.createObjectURL(new window.Blob([local.db.dbExport()]));
                document.querySelector('#dbExportA1').href = tmp;
                document.querySelector('#dbExportA1').click();
                setTimeout(function () {
                    window.URL.revokeObjectURL(tmp);
                }, 30000);
                break;
            case 'dbImportButton1':
                document.querySelector('#dbImportInput1').click();
                break;
            case 'dbImportInput1':
                local.ajaxProgressShow();
                reader = new window.FileReader();
                tmp = document.querySelector('#dbImportInput1').files[0];
                if (!tmp) {
                    return;
                }
                reader.addEventListener('load', function () {
                    local.db.dbImport(reader.result);
                    local.ajaxProgressUpdate();
                });
                reader.readAsText(tmp);
                break;
            case 'dbResetButton1':
                local.dbReset();
                break;
            case 'testRunButton1':
                // show tests
                if (document.querySelector('#testReportDiv1').style.display === 'none') {
                    document.querySelector('#testReportDiv1').style.display = 'block';
                    document.querySelector('#testRunButton1').innerText = 'hide internal test';
                    local.modeTest = true;
                    local.testRunDefault(local);
                // hide tests
                } else {
                    document.querySelector('#testReportDiv1').style.display = 'none';
                    document.querySelector('#testRunButton1').innerText = 'run internal test';
                }
                break;
            }
        };
        // init event-handling
        ['change', 'click'].forEach(function (event) {
            Array.from(document.querySelectorAll('.on' + event)).forEach(function (element) {
                element.addEventListener(event, local.testRun);
            });
        });
        // init ui
        local.swgg.uiEventListenerDict['.onEventUiReload']();
        // run tests
        local.runIfTrue(local.modeTest, function () {
            document.querySelector('#testRunButton1').innerText = 'hide internal test';
        });
        break;



    /* istanbul ignore next */
    // run node js-env code - post-init
    case 'node':
        // export local
        module.exports = local;
        // require modules
        local.fs = require('fs');
        local.http = require('http');
        local.url = require('url');
        // init assets
        local.assetsDict = local.assetsDict || {};
        /* jslint-ignore-begin */
        local.assetsDict['/assets.index.template.html'] = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>{{env.npm_package_nameAlias}} v{{env.npm_package_version}}</title>\n<style>\n/*csslint\n    box-sizing: false,\n    universal-selector: false\n*/\n* {\n    box-sizing: border-box;\n}\nbody {\n    background: #fff;\n    font-family: Arial, Helvetica, sans-serif;\n    margin: 2rem;\n}\nbody > * {\n    margin-bottom: 1rem;\n}\n</style>\n<style>\n/*csslint\n    adjoining-classes: false,\n    box-model: false,\n    box-sizing: false,\n    universal-selector: false\n*/\n/* example.js */\nbody > button {\n    width: 15rem;\n}\n.zeroPixel {\n    border: 0;\n    height: 0;\n    margin: 0;\n    padding: 0;\n    width: 0;\n}\n\n\n\n/* animate */\n.swggAnimateFade {\n    transition: opacity 250ms;\n}\n@keyframes swggAnimateShake {\n    100% {\n        transform: translateX(0);\n    }\n    0%, 20%, 60% {\n        transform: translateX(1rem);\n    }\n    40%, 80% {\n        transform: translateX(-1rem);\n    }\n}\n.swggAnimateShake {\n    animation-duration: 500ms;\n    animation-name: swggAnimateShake;\n}\n.swggAnimateSlide {\n    overflow-y: hidden;\n    transition: max-height 500ms;\n}\n\n\n\n/* general */\n.swggUiContainer,\n.swggUiContainer * {\n    box-sizing: border-box;\n    margin: 0;\n    padding: 0;\n}\n.swggUiContainer {\n    font-family: Arial, Helvetica, sans-serif;\n    margin-left: auto;\n    margin-right: auto;\n    max-width: 1024px;\n}\n.swggUiContainer > * {\n    margin-top: 1rem;\n}\n.swggUiContainer a {\n    text-decoration: none;\n}\n.swggUiContainer a:hover {\n    color: black;\n}\n.swggUiContainer a,\n.swggUiContainer input,\n.swggUiContainer span {\n    min-height: 1.5rem;\n}\n.swggUiContainer button {\n    padding: 0.5rem;\n}\n.swggUiContainer .color777 {\n    color: #777;\n}\n.swggUiContainer button,\n.swggUiContainer .cursorPointer,\n.swggUiContainer .cursorPointer input {\n    cursor: pointer;\n}\n.swggUiContainer .flex1 {\n    flex: 1;\n}\n.swggUiContainer .fontLineThrough {\n    text-decoration: line-through;\n}\n.swggUiContainer .fontWeightBold {\n    font-weight: bold;\n}\n.swggUiContainer input {\n    height: 1.5rem;\n    padding-left: 0.25rem;\n    padding-right: 0.25rem;\n}\n.swggUiContainer .marginTop05 {\n    margin-top: 0.5rem;\n}\n.swggUiContainer .marginTop10 {\n    margin-top: 1rem;\n}\n.swggUiContainer pre,\n.swggUiContainer textarea {\n    font-family: Menlo, Monaco, Consolas, Courier New, monospace;\n    font-size: small;\n    line-height: 1.25rem;\n    max-height: 20rem;\n    overflow: auto;\n    padding: 0.25rem;\n    white-space: pre;\n}\n.swggUiContainer .tr {\n    display: flex;\n}\n.swggUiContainer .tr > * {\n    margin-left: 1rem;\n    overflow: auto;\n    padding-top: 0.1rem;\n    word-wrap: break-word;\n}\n.swggUiContainer .tr > *:first-child {\n    margin-left: 0;\n}\n.swggUiContainer .tr > * > * {\n    width: 100%;\n}\n\n\n\n/* border */\n/* border-bottom-bold */\n.swggUiContainer .borderBottom {\n    border-bottom: 1px solid #bbb;\n    margin-bottom: 0.5rem;\n    padding-bottom: 0.5rem;\n}\n.swggUiContainer .borderBottomBold {\n    border-bottom: 1px solid #777;\n    margin-bottom: 0.5rem;\n    padding-bottom: 0.5rem;\n}\n/* border-top */\n.swggUiContainer .borderTop {\n    border-top: 1px solid #bbb;\n    margin-top: 0.5rem;\n    padding-top: 0.5rem;\n}\n/* border-top-bold */\n.swggUiContainer .borderTopBold,\n.swggUiContainer .resource:first-child {\n    border-top: 1px solid #777;\n    margin-top: 0.5rem;\n    padding-top: 0.5rem;\n}\n/* border-error*/\n.swggUiContainer .error {\n    border: 5px solid #b00;\n}\n\n\n\n/* datatable color */\n.swggUiContainer .datatable tbody > tr > td {\n    background: #efe;\n}\n.swggUiContainer .datatable tbody > tr > td:nth-child(odd) {\n    background: #dfd;\n}\n.swggUiContainer .datatable tbody > tr:nth-child(odd) > td {\n    background: #cfc;\n}\n.swggUiContainer .datatable tbody > tr:nth-child(odd) > td:nth-child(odd) {\n    background: #beb;\n}\n.swggUiContainer .datatable tbody > tr:hover > td {\n    background: #aea;\n}\n.swggUiContainer .datatable tbody > tr:hover > td:nth-child(odd) {\n    background: #9e9;\n}\n.swggUiContainer .datatable tbody > tr > td:hover,\n.swggUiContainer .datatable tbody > tr > td:hover:nth-child(odd),\n.swggUiContainer .datatable tbody > tr:nth-child(odd) > td:hover,\n.swggUiContainer .datatable tbody > tr:nth-child(odd) > td:hover:nth-child(odd),\n.swggUiContainer .datatable th:hover {\n    background: #7d7;\n}\n.swggUiContainer .datatable tbody > tr.selected > td {\n    background: #fee;\n}\n.swggUiContainer .datatable tbody > tr.selected > td:nth-child(odd) {\n    background: #fdd;\n}\n.swggUiContainer .datatable tbody > tr.selected:nth-child(odd) > td {\n    background: #ecc;\n}\n.swggUiContainer .datatable tbody > tr.selected:nth-child(odd) > td:nth-child(odd) {\n    background: #ebb;\n}\n.swggUiContainer .datatable th {\n    background: #9e9;\n}\n\n\n\n/* section */\n.swggUiContainer .datatable {\n    background: #fff;\n    background: rgba(255,255,255,0.875);\n    margin: 2rem;\n    overflow: auto;\n    padding: 1rem;\n}\n.swggUiContainer .datatable input[type=checkbox] {\n    width: 1.5rem;\n}\n.swggUiContainer .datatable .sortAsc,\n.swggUiContainer .datatable .sortDsc {\n    display: none;\n}\n.swggUiContainer .datatable td,\n.swggUiContainer .datatable th {\n    max-width: 10rem;\n    overflow: auto;\n    padding: 0.5rem;\n}\n.swggUiContainer .datatable th:first-child {\n    padding-right: 2rem;\n}\n.swggUiContainer > .header {\n    background: #8c0;\n    padding: 0.5rem;\n}\n.swggUiContainer > .header > .td1 {\n    font-size: x-large;\n    background: transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAqRJREFUeNrEVz1s00AUfnGXii5maMXoEUEHVwIpEkPNgkBdMnQoU5ytiKHJwpp2Q2JIO8DCUDOxIJFIVOoWZyJSh3pp1Q2PVVlcCVBH3ufeVZZ9Zye1Ay86nXV+ue/9fO/lheg/Se02X1rvksmbnTiKvuxQMBNgBnN4a/LCbmnUAP6JV58NCUsBC8CuAJxGPF47OgNqBaA93tolUhnx6jC4NxGwyOEwlccyAs+3kwdzKq0HDn2vEBTi8J2XpyMaywNDE157BhXUE3zJhlq8GKq+Zd2zaWHepPA8oN9XkfLmRdOiJV4XUUg/IyWncLjCYY/SHndV2u7zHr3bPKZtdxgboJOnthvrfGj/oMf3G0r7JVmNlLfKklmrt2MvvcNO7LFOhoFHfuAJI5o6ta10jpt5CQLgwXhXG2YIwvu+34qf78ybOjWTnWwkgR36d7JqJOrW0hHmNrKg9xhiS4+1jFmrxymh03B0w+6kURIAu3yHtOD5oaUNojMnGgbcctNvwdAnyxvxRR+/vaJnjzbpzcZX+nN1SdGv85i9eH8w3qPO+mdm/y4dnQ1iI8Fq6Nf4cxL6GWSjiFDSs0VRnxC5g0xSB2cgHpaseTxfqOv5uoHkNQ6Ha/N1Yz9mNMppEkEkYKj79q6uCq4bCHcSX3fJ0Vk/k9siASjCm1N6gZH6Ec9IXt2WkFES2K/ixoIyktJPAu/ptOA1SgO5zqtr6KASJPF0nMV8dgMsRhRPOcMwqQAOoi0VAIMLAEWJ6YYC1c8ibj1GP51RqwzYwZVMHQuvOzMCBUtb2tGHx5NAdLKqp5AX7Ng4d+Zi8AGDI9z1ijx9yaCH04y3GCP2S+QcvaGl+pcxyUBvinFlawoDQjHSelX8hQEoIrAq8p/mgC88HOS1YCl/BRgAmiD/1gn6Nu8AAAAASUVORK5CYII=) no-repeat left center;\n    padding-left: 2.5rem;\n    color: white;\n}\n.swggUiContainer > .header > .td2 {\n    font-size: medium;\n    height: 2rem;\n}\n.swggUiContainer > .header > .td3 {\nborder: 0;\n    color: #fff;\n    padding: 6px 8px;\n    background-color: #580;\n}\n.swggUiContainer > .info > * {\n    margin-top: 1rem;\n}\n.swggUiContainer > .info a {\n    color: #370;\n    text-decoration: underline;\n}\n.swggUiContainer > .info > .fontWeightBold {\n    font-size: x-large;\n}\n.swggUiContainer > .info > ul {\n    margin-left: 2rem;\n}\n.swggUiContainer > .modal {\n    background: black;\n    background: rgba(0,0,0,0.5);\n    display: flex;\n    height: 100%;\n    left: 0;\n    margin: 0;\n    margin-top: 4px;\n    padding: 0;\n    position: fixed;\n    top: 0;\n    width: 100%;\n    z-index: 1;\n}\n.swggUiContainer .operation {\n    background: #dfd;\n    font-size: smaller;\n}\n.swggUiContainer .operation > .content {\n    padding: 1rem;\n}\n.swggUiContainer .operation > .content .label {\n    color: #0b0;\n}\n.swggUiContainer .operation > .content pre {\n    border: 1px solid #bbb;\n    background: #ffd;\n}\n.swggUiContainer .operation > .content .tr {\n    margin-left: 0.5rem;\n}\n.swggUiContainer .operation > .header:hover {\n    background: #bfb;\n}\n.swggUiContainer .operation > .header > span {\n    padding: 2px 0 2px 0;\n}\n.swggUiContainer .operation > .header > span:first-child {\n    margin-left: 0;\n}\n.swggUiContainer .operation > .header > .td1 {\n    background: #777;\n    color: white;\n    padding-top: 5px;\n    height: 1.5rem;\n    text-align: center;\n    width: 5rem;\n}\n.swggUiContainer .operation > .header > .td2 {\n    flex: 3;\n}\n.swggUiContainer .operation > .header > .td3 {\n    color: #777;\n    flex: 2;\n    text-decoration: none;\n}\n.swggUiContainer .operation > .header > .td4 {\n    flex: 2;\n    padding-right: 1rem;\n}\n.swggUiContainer .operation .paramDef pre,\n.swggUiContainer .operation .paramDef textarea {\n    height: 10rem;\n}\n.swggUiContainer .operation .paramDef > .td1 {\n    flex: 2;\n}\n.swggUiContainer .operation .paramDef > .td2 {\n    flex: 1;\n}\n.swggUiContainer .operation .paramDef > .td3 {\n    flex: 4;\n}\n.swggUiContainer .operation .paramDef > .td4 {\n    flex: 3;\n}\n.swggUiContainer .operation .responseList > .td1 {\n    flex: 1;\n}\n.swggUiContainer .operation .responseList > .td2 {\n    flex: 4;\n}\n.swggUiContainer .resource > .header > .td1 {\n    font-size: large;\n}\n.swggUiContainer .resource > .header > .td2,\n.swggUiContainer .resource > .header > .td3 {\n    border-right: 1px solid #777;\n    padding-right: 1rem;\n}\n\n\n\n/* method */\n.swggUiContainer .operation.DELETE > .header > .td1 {\n    background: #b00;\n}\n.swggUiContainer .operation.GET > .header > .td1 {\n    background: #093;\n}\n.swggUiContainer .operation.HEAD > .header > .td1 {\n    background: #f30;\n}\n.swggUiContainer .operation.PATCH > .header > .td1 {\n    background: #b0b;\n}\n.swggUiContainer .operation.POST > .header > .td1 {\n    background: #07b;\n}\n.swggUiContainer .operation.PUT > .header > .td1 {\n    background: #70b;\n}\n/*csslint\n*/\n</style>\n</head>\n<body>\n<!-- utility2-comment\n    <div id="ajaxProgressDiv1" style="background: #d00; height: 2px; left: 0; margin: 0; padding: 0; position: fixed; top: 0; transition: background 0.5s, width 1.5s; width: 25%;"></div>\nutility2-comment -->\n    <h1>\n<!-- utility2-comment\n        <a\n            {{#if env.npm_package_homepage}}\n            href="{{env.npm_package_homepage}}"\n            {{/if env.npm_package_homepage}}\n            target="_blank"\n        >\nutility2-comment -->\n            {{env.npm_package_nameAlias}} v{{env.npm_package_version}}\n<!-- utility2-comment\n        </a>\nutility2-comment -->\n    </h1>\n    <h3>{{env.npm_package_description}}</h3>\n<!-- utility2-comment\n    <h4><a download href="assets.app.js">download standalone app</a></h4>\n    <button class="onclick" id="testRunButton1">run internal test</button><br>\n    <div id="testReportDiv1" style="display: none;"></div>\nutility2-comment -->\n\n    <button class="onclick" id="dbResetButton1">reset database</button><br>\n    <button class="onclick" id="dbExportButton1">export database -&gt; file</button><br>\n    <a download="db.persistence.json" href="" id="dbExportA1"></a>\n    <button class="onclick" id="dbImportButton1">import database &lt;- file</button><br>\n    <input class="onchange zeroPixel" type="file" id="dbImportInput1">\n    <div class="swggUiContainer">\n<form2 class="header tr">\n    <a class="td1" href="http://swagger.io" target="_blank">swagger</a>\n    <input\n        class="flex1 td2"\n        type="text"\n        value="{{env.npm_config_swagger_basePath}}/swagger.json"\n    >\n    <button class="td3">Explore</button>\n</form2>\n    </div>\n<!-- utility2-comment\n    {{#if isRollup}}\n    <script src="assets.app.js"></script>\n    {{#unless isRollup}}\nutility2-comment -->\n    <script src="assets.swgg.rollup.js"></script>\n    <script src="assets.swgg.js"></script>\n    <script src="jsonp.utility2._stateInit?callback=window.utility2._stateInit"></script>\n    <script>window.utility2.onResetBefore.counter += 1;</script>\n    <script src="assets.example.js"></script>\n    <script src="assets.test.js"></script>\n    <script>window.utility2.onResetBefore();</script>\n<!-- utility2-comment\n    {{/if isRollup}}\nutility2-comment -->\n</body>\n</html>\n';
















































































































































































































































































































































































































































































        /* jslint-ignore-end */
        if (local.templateRender) {
            local.assetsDict['/'] = local.templateRender(
                local.assetsDict['/assets.index.template.html'],
                {
                    env: local.objectSetDefault(local.env, {
                        npm_package_description: 'example module',
                        npm_package_nameAlias: 'example',
                        npm_package_version: '0.0.1'
                    })
                }
            );
        } else {
            local.assetsDict['/'] = local.assetsDict['/assets.index.template.html']
                .replace((/\{\{env\.(\w+?)\}\}/g), function (match0, match1) {
                    // jslint-hack
                    String(match0);
                    switch (match1) {
                    case 'npm_package_description':
                        return 'example module';
                    case 'npm_package_nameAlias':
                        return 'example';
                    case 'npm_package_version':
                        return '0.0.1';
                    }
                });
        }
        // run the cli
        if (local.global.utility2_rollup || module !== require.main) {
            break;
        }
        local.assetsDict['/assets.example.js'] = local.assetsDict['/assets.example.js'] ||
            local.fs.readFileSync(__filename, 'utf8');
        local.assetsDict['/assets.swgg.rollup.js'] =
            local.assetsDict['/assets.swgg.rollup.js'] || local.fs.readFileSync(
                local.swgg.__dirname + '/lib.swgg.js',
                'utf8'
            ).replace((/^#!/), '//');
        local.assetsDict['/favicon.ico'] = local.assetsDict['/favicon.ico'] || '';
        // if $npm_config_timeout_exit exists,
        // then exit this process after $npm_config_timeout_exit ms
        if (Number(process.env.npm_config_timeout_exit)) {
            setTimeout(process.exit, Number(process.env.npm_config_timeout_exit));
        }
        // start server
        if (local.global.utility2_serverHttp1) {
            break;
        }
        process.env.PORT = process.env.PORT || '8081';
        console.log('server starting on port ' + process.env.PORT);
        local.http.createServer(function (request, response) {
            request.urlParsed = local.url.parse(request.url);
            if (local.assetsDict[request.urlParsed.pathname] !== undefined) {
                response.end(local.assetsDict[request.urlParsed.pathname]);
                return;
            }
            response.statusCode = 404;
            response.end();
        }).listen(process.env.PORT);
        break;
    }
}());