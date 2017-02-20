























































































/*
example.js

this script will run a standalone swagger-ui server backed by db-lite

instruction
    1. save this script as example.js
    2. run the shell command:
        $ npm install swgg &&             export PORT=8081 &&             node example.js


    3. play with the browser-demo on http://localhost:8081
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



    // run node js-env code - post-init
    case 'node':
        // export local
        module.exports = local;
        // init assets
        local.tryCatchOnError(function () {
            local.assetsWrite(
                '/assets.example.js',
                local.fs.readFileSync(__filename, 'utf8')
            );
        }, local.nop);
        /* jslint-ignore-begin */
        // https://github.com/swagger-api/swagger-ui/blob/v2.1.3/dist/index.html
        local.templateIndexHtml = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>{{env.npm_package_name}} v{{env.npm_package_version}}</title>\n<link href="assets.swgg.css" rel="stylesheet">\n<style>\n/*csslint\n    box-sizing: false,\n    universal-selector: false\n*/\n* {\n    box-sizing: border-box;\n}\nbody {\n    background: #fff;\n    font-family: Arial, Helvetica, sans-serif;\n    margin: 2rem;\n}\nbody > * {\n    margin-bottom: 1rem;\n}\n</style>\n<style>\n/*csslint\n*/\nbody > button {\n    width: 15rem;\n}\n.zeroPixel {\n    border: 0;\n    height: 0;\n    margin: 0;\n    padding: 0;\n    width: 0;\n}\n</style>\n</head>\n<body>\n<!-- utility2-comment\n    <div id="ajaxProgressDiv1" style="background: #d00; height: 4px; left: 0; margin: 0; padding: 0; position: fixed; top: 0; transition: background 0.5s, width 1.5s; width: 25%;"></div>\nutility2-comment -->\n    <h1>\n<!-- utility2-comment\n        <a\n            {{#if env.npm_package_homepage}}\n            href="{{env.npm_package_homepage}}"\n            {{/if env.npm_package_homepage}}\n            target="_blank"\n        >\nutility2-comment -->\n            {{env.npm_package_name}} v{{env.npm_package_version}}\n<!-- utility2-comment\n        </a>\nutility2-comment -->\n    </h1>\n    <h3>{{env.npm_package_description}}</h3>\n<!-- utility2-comment\n    <h4><a download href="assets.app.js">download standalone app</a></h4>\n    <button class="onclick" id="testRunButton1">run internal test</button><br>\n    <div id="testReportDiv1" style="display: none;"></div>\nutility2-comment -->\n\n    <button class="onclick" id="dbResetButton1">reset database</button><br>\n    <button class="onclick" id="dbExportButton1">export database -&gt; file</button><br>\n    <a download="db.persistence.json" href="" id="dbExportA1"></a>\n    <button class="onclick" id="dbImportButton1">import database &lt;- file</button><br>\n    <input class="onchange zeroPixel" type="file" id="dbImportInput1">\n    <div class="swggUiContainer">\n    <form class="header tr">\n        <a class="td1" href="http://swagger.io" target="_blank">swagger</a>\n        <input\n            class="flex1 td2"\n            placeholder="http://petstore.swagger.io/v2/swagger.json"\n            type="text"\n            value="{{env.npm_config_swagger_basePath}}/swagger.json"\n        >\n    </form>\n    <div class="reset"></div>\n    </div>\n<!-- utility2-comment\n    {{#if isRollup}}\n    <script src="assets.app.min.js"></script>\n    {{#unless isRollup}}\nutility2-comment -->\n    <script src="assets.utility2.rollup.js"></script>\n    <script src="assets.swgg.js"></script>\n    <script src="assets.lib.swgg.ui.js"></script>\n    <script src="jsonp.utility2._stateInit?callback=window.utility2._stateInit"></script>\n    <script>window.utility2.onResetBefore.counter += 1;</script>\n    <script src="assets.example.js"></script>\n    <script src="assets.test.js"></script>\n    <script>window.utility2.onResetBefore();</script>\n<!-- utility2-comment\n    {{/if isRollup}}\nutility2-comment -->\n</body>\n</html>\n';




































































































        /* jslint-ignore-end */
        local.assetsDict['/'] = local.templateRender(local.templateIndexHtml, {
            env: local.objectSetDefault(local.env, {
                npm_package_description: 'example module',
                npm_package_name: 'example',
                npm_package_version: '0.0.1'
            })
        });
        break;
    }



    // run shared js-env code - post-init
    (function () {
        // init petstore-api - frontend
        local.tmp = JSON.parse(local.assetsDict['/assets.lib.swgg.petstore.json']);
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
}());