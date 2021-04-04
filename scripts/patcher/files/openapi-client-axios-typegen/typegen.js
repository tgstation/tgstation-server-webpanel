"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOperationMethodTypings = exports.generateTypesForDocument = exports.main = void 0;
var lodash_1 = __importDefault(require("lodash"));
var yargs_1 = __importDefault(require("yargs"));
var indent_string_1 = __importDefault(require("indent-string"));
var __1 = __importStar(require("openapi-client-axios"));
var dtsGenerator_1 = __importDefault(require("@anttiviljami/dtsgenerator/dist/core/dtsGenerator"));
var jsonSchema_1 = require("@anttiviljami/dtsgenerator/dist/core/jsonSchema");
var referenceResolver_1 = __importDefault(require("@anttiviljami/dtsgenerator/dist/core/referenceResolver"));
var schemaConvertor_1 = __importDefault(require("@anttiviljami/dtsgenerator/dist/core/schemaConvertor"));
var writeProcessor_1 = __importDefault(require("@anttiviljami/dtsgenerator/dist/core/writeProcessor"));
var typeNameConvertor_1 = require("@anttiviljami/dtsgenerator/dist/core/typeNameConvertor");
var json_schema_ref_parser_1 = require("@apidevtools/json-schema-ref-parser");
var typeNameConvertor_1 = require("@anttiviljami/dtsgenerator/dist/core/typeNameConvertor");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var argv, opts, _a, modulePath, func, module_1, _b, imports, schemaTypes, operationTypings;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    argv = yargs_1.default
                        .option('transformOperationName', {
                        alias: 't',
                        type: 'string',
                    })
                        .usage('Usage: $0 [file]')
                        .example('$0 ./openapi.yml > client.d.ts', '- generate a type definition file')
                        .demandCommand(1).argv;
                    opts = {
                        transformOperationName: function (operation) { return operation; },
                    };
                    if (!argv.transformOperationName) return [3 /*break*/, 2];
                    _a = argv.transformOperationName.split(/\.(?=[^\.]+$)/), modulePath = _a[0], func = _a[1];
                    if (!modulePath || !func) {
                        throw new Error('transformOperationName must be provided in {path-to-module}.{exported-function} format');
                    }
                    return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require(modulePath)); })];
                case 1:
                    module_1 = _c.sent();
                    if (!module_1[func]) {
                        throw new Error("Could not find transform function " + func + " in " + modulePath);
                    }
                    opts.transformOperationName = module_1[func];
                    _c.label = 2;
                case 2: return [4 /*yield*/, generateTypesForDocument(argv._[0], opts)];
                case 3:
                    _b = _c.sent(), imports = _b[0], schemaTypes = _b[1], operationTypings = _b[2];
                    console.log(imports, '\n');
                    console.log(schemaTypes);
                    console.log(operationTypings);
                    return [2 /*return*/];
            }
        });
    });
}
exports.main = main;
function generateTypesForDocument(definition, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var api, processor, resolver, convertor, rootSchema, generator, schemaTypes, exportedTypes, operationTypings, imports;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    api = new __1.default({ definition: definition });
                    return [4 /*yield*/, api.init()];
                case 1:
                    _a.sent();
                    processor = new writeProcessor_1.default({ indentSize: 2, indentChar: ' ' });
                    resolver = new referenceResolver_1.default();
                    convertor = new schemaConvertor_1.default(processor);
                    return [4 /*yield*/, json_schema_ref_parser_1.bundle(definition)];
                case 2:
                    rootSchema = _a.sent();
                    resolver.registerSchema(jsonSchema_1.parseSchema(rootSchema));
                    generator = new dtsGenerator_1.default(resolver, convertor);
                    return [4 /*yield*/, generator.generate()];
                case 3:
                    schemaTypes = _a.sent();
                    exportedTypes = convertor.getExports();
                    operationTypings = generateOperationMethodTypings(api, exportedTypes, opts);
                    imports = [
                        'import {',
                        '  OpenAPIClient,',
                        '  Parameters,',
                        '  UnknownParamsObject,',
                        '  OperationResponse,',
                        '  AxiosRequestConfig,',
                        "} from 'openapi-client-axios';",
                    ].join('\n');
                    return [2 /*return*/, [imports, schemaTypes, operationTypings]];
            }
        });
    });
}
exports.generateTypesForDocument = generateTypesForDocument;
// tslint:disable-next-line:max-line-length
function generateMethodForOperation(methodName, operation, exportTypes) {
    var operationId = typeNameConvertor_1.normalizeTypeName(operation.operationId), summary = operation.summary, description = operation.description;
    // parameters arg
    var normalizedOperationId = typeNameConvertor_1.normalizeTypeName(operationId);
    var parameterTypePaths = lodash_1.default.chain([
        lodash_1.default.find(exportTypes, { schemaRef: "#/paths/" + normalizedOperationId + "/pathParameters" }),
        lodash_1.default.find(exportTypes, { schemaRef: "#/paths/" + normalizedOperationId + "/queryParameters" }),
        lodash_1.default.find(exportTypes, { schemaRef: "#/paths/" + normalizedOperationId + "/headerParameters" }),
        lodash_1.default.find(exportTypes, { schemaRef: "#/paths/" + normalizedOperationId + "/cookieParameters" }),
    ])
        .filter()
        .map('path')
        .value();
    var parametersType = !lodash_1.default.isEmpty(parameterTypePaths) ? parameterTypePaths.join(' & ') : 'UnknownParamsObject';
    var parametersArg = !lodash_1.default.isEmpty(parameterTypePaths)
        ? "parameters?: Parameters<" + parametersType + ">"
        : "parameters?: null";
    // payload arg
    var requestBodyType = lodash_1.default.find(exportTypes, { schemaRef: "#/paths/" + normalizedOperationId + "/requestBody" });
    var dataArg = requestBodyType ? "data: " + requestBodyType.path : "data?: null";
    // return type
    var responseTypePaths = lodash_1.default.chain(exportTypes)
        .filter(function (_a) {
        var schemaRef = _a.schemaRef;
        return schemaRef.startsWith("#/paths/" + normalizedOperationId + "/responses");
    })
        .map(function (_a) {
        var path = _a.path;
        return path
            .split('.')
            // Operation.Responses.200 => Operation.Responses.$200
            .map(function (key, i) { return (i === path.split('.').length - 1 ? "$" + key : key); })
            .join('.');
    })
        .value();
    var responseType = !lodash_1.default.isEmpty(responseTypePaths) ? responseTypePaths.join(' | ') : 'any';
    var returnType = "OperationResponse<" + responseType + ">";
    var operationArgs = [parametersArg, dataArg, 'config?: AxiosRequestConfig'];
    var operationMethod = "'" + typeNameConvertor_1.normalizeTypeName(methodName) + "'(\n" + operationArgs
        .map(function (arg) { return indent_string_1.default(arg, 2); })
        .join(',\n') + "  \n): " + returnType;
    // comment for type
    var content = lodash_1.default.filter([summary, description]).join('\n\n');
    var comment = '/**\n' +
        indent_string_1.default(content === '' ? operationId : operationId + " - " + content, 1, {
            indent: ' * ',
            includeEmptyLines: true,
        }) +
        '\n */';
    return [comment, operationMethod].join('\n');
}
// tslint:disable-next-line:max-line-length
function generateOperationMethodTypings(api, exportTypes, opts) {
    var operations = api.getOperations();
    var operationTypings = operations.map(function (op) {
        return generateMethodForOperation(opts.transformOperationName(op.operationId), op, exportTypes);
    });
    var pathOperationTypes = lodash_1.default.entries(api.definition.paths).map(function (_a) {
        var path = _a[0], pathItem = _a[1];
        var methodTypings = [];
        for (var m in pathItem) {
            if (pathItem[m] && lodash_1.default.includes(Object.values(__1.HttpMethod), m)) {
                var method = m;
                var operation = lodash_1.default.find(operations, { path: path, method: method });
                methodTypings.push(generateMethodForOperation(method, operation, exportTypes));
            }
        }
        return __spreadArrays(["['" + path + "']: {"], methodTypings.map(function (m) { return indent_string_1.default(m, 2); }), ['}']).join('\n');
    });
    return __spreadArrays([
        'export interface OperationMethods {'
    ], operationTypings.map(function (op) { return indent_string_1.default(op, 2); }), [
        '}',
        '',
        'export interface PathsDictionary {'
    ], pathOperationTypes.map(function (p) { return indent_string_1.default(p, 2); }), [
        '}',
        '',
        'export type Client = OpenAPIClient<OperationMethods, PathsDictionary>',
    ]).join('\n');
}
exports.generateOperationMethodTypings = generateOperationMethodTypings;
if (require.main === module) {
    main();
}
//# sourceMappingURL=typegen.js.map
