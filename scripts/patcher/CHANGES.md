# openapi-client-axios

## client.js

getRequestConfigForOperation:
```diff
--- client.js
+++ client.js
@@ -484 +484 @@
            } else if (typeof paramsArg === "object") {
                // ParamsObject
                for (var name in paramsArg) {
-                   if (paramsArg[name]) {
+                   if (paramsArg[name] !== undefined) {
                        setRequestParam(name, paramsArg[name], getParamType(name));
                    }
                }
```
## types/client.d.ts
```diff
--- types/client.d.ts
+++ types/client.d.ts
@@ -39 +39 @@
- export interface UnknownParamsObject {
-     [parameter: string]: ImplicitParamValue | ImplicitParamValue[];
- }
+ export declare type UnknownParamsObject = {};
```

# openapi-client-axios-typegen
## typegen.js
```diff
--- typegen.js
+++ typegen.js
@@ -166 +158 @@
  var writeProcessor_1 = __importDefault(
      require("@anttiviljami/dtsgenerator/dist/core/writeProcessor")
+ var typeNameConvertor_1 = require("@anttiviljami/dtsgenerator/dist/core/typeNameConvertor");
@@ -252 +242 @@
 function generateMethodForOperation(methodName, operation, exportTypes) {
-    var operationId = operation.operationId,
+    var operationId = typeNameConvertor_1.normalizeTypeName(operation.operationId),
         summary = operation.summary,
         description = operation.description;
@@ -276 +265 @@
     var parametersType = !lodash_1.default.isEmpty(parameterTypePaths)
         ? parameterTypePaths.join(" & ")
         : "UnknownParamsObject";
-    var parametersArg = "parameters?: Parameters<" + parametersType + ">";
+    var parametersArg = !lodash_1.default.isEmpty(parameterTypePaths)
+        ? "parameters: Parameters<" + parametersType + ">"
+        : "parameters?: null";
     // payload arg
     var requestBodyType = lodash_1.default.find(exportTypes, {
         schemaRef: "#/paths/" + operationId + "/requestBody"
     });
-    var dataArg = "data?: " + (requestBodyType ? requestBodyType.path : "any");
+    var dataArg = requestBodyType ? "data: " + requestBodyType.path : "data?: null";
@@ -286 +277 @@
     var responseTypePaths = lodash_1.default
         .chain(exportTypes)
         .filter(function(_a) {
             var schemaRef = _a.schemaRef;
             return schemaRef.startsWith("#/paths/" + operationId + "/responses");
         })
         .map("path")
+        .map(function (arg) {
+           return arg.replace(/\.(?=\d)/, ".$");
+        })
         .value();
@@ -299 +293 @@
     var operationMethod =
-        methodName +
+        typeNameConvertor_1.normalizeTypeName(methodName) +
         "(\n" +
         operationArgs
             .map(function(arg) {
                 return indent_string_1.default(arg, 2);
             })
             .join(",\n") +
         "  \n): " +
         returnType;
```

# @anttiviljami
## core/dtsGenerator.js
```diff
--- core/dtsGenerator.js
+++ core/dtsGenerator.js
@@ -92 +108 @@
                         var sub = _c.value;
-                        if (typeof sub === "object" && sub.$ref) {
+                        if (typeof sub === "object" && sub.$ref && false) {
                             var ref = this.resolver.dereference(sub.$ref);
@@ -169 +207 @@
                     this.convertor.outputComments(schema);
                     this.convertor.outputPropertyAttribute(schema);
-                    this.convertor.outputPropertyName(schema, propertyName, baseSchema.content.required);
+                    this.convertor.outputPropertyName(
+                        schema,
+                        propertyName,
+                        !!schema.content.nullable
+                    );
@@ -192 +234 @@
         if (content.$ref) {
             var ref = this.resolver.dereference(content.$ref);
             if (ref.id == null) {
                 throw new Error("target referenced id is nothing: " + content.$ref);
             }
             var refSchema = this.normalizeContent(ref);
-            return this.convertor.outputTypeIdName(refSchema, this.currentSchema, terminate);
+            return this.convertor.outputTypeIdName(
+                refSchema,
+                this.currentSchema,
+                terminate,
+                !!content.nullable
+            );
@@ -287 +344 @@
     DtsGenerator.prototype.generateType = function(schema, terminate, outputOptional) {
         var _this = this;
         if (outputOptional === void 0) {
             outputOptional = true;
         }
         var type = schema.content.type;
         if (type == null) {
-            this.convertor.outputPrimitiveTypeName(schema, "any", terminate, outputOptional);
+            this.convertor.outputPrimitiveTypeName(schema, "void", terminate, outputOptional);
```
## core/jsonSchema.js
```diff
--- core/jsonSchema.js
+++ core/jsonSchema.js
@@ -188 +178 @@
+        var setSubIdToParameterObjectNoName = function(obj, keys) {
+            return setSubIdToAnyObject(setSubIdToParameterNoName, obj, keys);
+        };
+
+        function setSubIdToParameterNoName(param, keys) {
+            if ("schema" in param) {
+                setSubId(param.schema, keys);
+            }
+        }
         function setSubIdToParameters(array, keys) {
             if (array == null) {
                 return;
             }
-             var map = new Map();
+             var params = new Map();
+             var refs = new Map();
             array.forEach(function(item) {
+                var _a, _b, _c;
                 if ("schema" in item) {
                     setSubIdToParameter(item, keys);
-                     var work = map.get(item.in);
+                     var work = params.get(item.in);
                     if (work == null) {
                         work = [];
-                        map.set(item.in, work);
+                        params.set(item.in, work);
                    }
+                    work.push(item);
+                } else if ("$ref" in item) {
+                    var result = /\/([^\/]*)$/.exec(item.$ref)[1];
+                    if (
+                        ((_a = item.$ref) === null || _a === void 0
+                            ? void 0
+                            : _a.includes("Api")) ||
+                        ((_b = item.$ref) === null || _b === void 0
+                            ? void 0
+                            : _b.includes("User-Agent"))
+                    ) {
+                        return;
+                    }
+                    setSubId(item, keys.concat(result));
+                    var work = void 0;
+                    if (
+                        (_c = item.$ref) === null || _c === void 0
+                            ? void 0
+                            : _c.includes("Instance")
+                    ) {
+                        work = refs.get("header");
+                        if (work == null) {
+                            work = [];
+                            refs.set("header", work);
+                        }
+                    } else {
+                        work = refs.get("path");
+                        if (work == null) {
+                            work = [];
+                            refs.set("path", work);
+                        }
                     }
                     work.push(item);
                 }
             });
-             addParameterSchema(map, keys);
+             addParameterSchema(params, refs, keys);
         }

-         function addParameterSchema(input, keys) {
-            var e_1, _a;
-            var e_1, _a, e_2, _b;
-            try {
-                for (
-                    var input_1 = tslib_1.__values(input), input_1_1 = input_1.next();
-                    !input_1_1.done;
-                    input_1_1 = input_1.next()
-                ) {
-                    var _b = tslib_1.__read(input_1_1.value, 2),
-                        key = _b[0],
-                        params = _b[1];
-                    var _c = tslib_1.__read(buildParameterSchema(key, params, keys), 2),
-                        paths = _c[0],
-                        obj = _c[1];
+         function addParameterSchema(params, refs, keys) {
+            var e_1, _a, e_2, _b;
+            try {
+                for (
+                    var params_1 = tslib_1.__values(params), params_1_1 = params_1.next();
+                    !params_1_1.done;
+                    params_1_1 = params_1.next()
+                ) {
+                    var _c = tslib_1.__read(params_1_1.value, 2),
+                        key = _c[0],
+                        param = _c[1];
+                    var _d = tslib_1.__read(buildParameterSchema(key, param, keys), 2),
+                        paths = _d[0],
+                        obj = _d[1];
                     setSubId(obj, paths);
                 }
             } catch (e_1_1) {
                 e_1 = { error: e_1_1 };
             } finally {
                 try {
-                     if (input_1_1 && !input_1_1.done && (_a = input_1.return))
-                         _a.call(input_1);
+                     if (params_1_1 && !params_1_1.done && (_a = params_1.return))
+                         _a.call(params_1);
                 } finally {
                     if (e_1) throw e_1.error;
                 }
             }
+            try {
+                for (
+                    var refs_1 = tslib_1.__values(refs), refs_1_1 = refs_1.next();
+                    !refs_1_1.done;
+                    refs_1_1 = refs_1.next()
+                ) {
+                    var _e = tslib_1.__read(refs_1_1.value, 2),
+                        key = _e[0],
+                        ref = _e[1];
+                    var _f = tslib_1.__read(buildParameterSchemaRefs(key, ref, keys), 2),
+                        paths = _f[0],
+                        obj = _f[1];
+                    setSubId(obj, paths);
+                }
+            } catch (e_2_1) {
+                e_2 = { error: e_2_1 };
+            } finally {
+                try {
+                    if (refs_1_1 && !refs_1_1.done && (_b = refs_1.return)) _b.call(refs_1);
+                } finally {
+                    if (e_2) throw e_2.error;
+                }
+            }
         }

         function buildParameterSchema(inType, params, keys) {
             var paths = keys.slice(0, keys.length - 1).concat(inType + "Parameters");
             var properties = {};
             params.forEach(function(item) {
                 properties[item.name] = { $ref: createId(keys.concat(item.name)) };
             });
             return [
                 paths,
                 {
                     id: createId(paths),
                     type: "object",
                     properties: properties,
                     required: params
                         .filter(function(item) {
                             return item.required === true;
                         })
                         .map(function(item) {
                             return item.name;
                         })
                 }
             ];
         }

+        function buildParameterSchemaRefs(inType, refs, keys) {
+            var paths = keys.slice(0, keys.length - 1).concat(inType + "Parameters");
+            var properties = {};
+            refs.forEach(function(item) {
+                if (item.$ref != null) {
+                    var result = /\/([^\/]*)$/.exec(item.$ref)[1];
+                    properties[result] = { $ref: createId(keys.concat(result)) };
+                }
+            });
+            return [
+                paths,
+                {
+                    id: createId(paths),
+                    type: "object",
+                    properties: properties,
+                    required: refs.map(function(item) {
+                        return /\/([^\/]*)$/.exec(item.$ref)[1];
+                    })
+                }
+            ];
+        }
@@ -405 +485 @@
        function setSubId(s, paths) {
            if (typeof s !== "object") {
                return;
            }
            if (typeof s.$ref === "string") {
-               var schemaId = new schemaId_1.default(s.$ref);
+               var thing = "#" + s.$ref.slice(1).split("/").map(convertKeyToTypeName).join("/");
+               var schemaId = new schemaId_1.default(thing);
                s.$ref = schemaId.getAbsoluteId();
                onFoundReference(schemaId);
            }
            var id = createId(paths);
            setId(schema.type, s, id);
            walk(s, paths, []);
        }

        if ("swagger" in openApi) {
            setSubIdToObject(openApi.definitions, ["definitions"]);
            setSubIdToParameterObject(openApi.parameters, ["parameters"]);
            setSubIdToResponsesV2(openApi.responses, ["responses"]);
            setSubIdToPathsV2(openApi.paths, ["paths"]);
        } else {
            if (openApi.components) {
                var components = openApi.components;
                setSubIdToObject(components.schemas, ["components", "schemas"]);
                setSubIdToResponsesV3(components.responses, [
                    "components",
                    "responses"
                ]);
-               setSubIdToParameterObject(components.parameters, [
+               setSubIdToParameterObjectNoName(components.parameters, [
+                   "components",
+                   "parameters"
+               ]);
                setSubIdToRequestBodies(components.requestBodies, [
                    "components",
                    "requestBodies"
                ]);
            }
            if (openApi.paths) {
                setSubIdToPathsV3(openApi.paths, ["paths"]);
            }
        }
    }
```

## core/schemaConvertor.js
```diff
--- core/schemaConvertor.js
+++ core/schemaConvertor.js
@@ -174 +185 @@
-    SchemaConvertor.prototype.outputPropertyName = function(_schema, propertyName, required) {
+    SchemaConvertor.prototype.outputPropertyName = function(_schema, propertyName, optional) {
-        var optionalProperty = required == null || required.indexOf(propertyName) < 0;
-        this.processor.outputKey(propertyName, optionalProperty).output(": ");
+        this.processor.outputKey(propertyName, optional).output(": ");
    };
@@ -203 +219 @@
-    SchemaConvertor.prototype.outputTypeIdName = function(schema, currentSchema, terminate, outputOptional) {
+    SchemaConvertor.prototype.outputTypeIdName = function(schema, currentSchema, terminate, nullable, outputOptional) {
         var _this = this;
         if (terminate === void 0) {
             terminate = true;
         }
+        if (nullable === void 0) {
+            nullable = false;
+        }
         if (outputOptional === void 0) {
             outputOptional = true;
         }
         var typeName = this.getTypename(schema.id, currentSchema);
         typeName.forEach(function(type, index) {
             var isLast = index === typeName.length - 1;
             _this.processor.outputType(type, isLast ? false : true);
             if (!isLast) {
                 _this.processor.output(".");
             }
         });
-        this.outputTypeNameTrailer(schema, terminate, outputOptional);
+        this.outputTypeNameTrailer(schema, terminate, outputOptional, nullable);
     };
@@ -271 +312 @@
-    SchemaConvertor.prototype.outputTypeNameTrailer = function(schema, terminate, outputOptional) {
+    SchemaConvertor.prototype.outputTypeNameTrailer = function(schema, terminate, outputOptional, nullable) {
+        if (nullable === void 0) {
+            nullable = false;
+        }
+
+        if (nullable) {
+            this.processor.output(" | null");
+        }
         if (terminate) {
             this.processor.output(";");
         }
         if (outputOptional) {
             this.outputOptionalInformation(schema, terminate);
         }
         if (terminate) {
             this.processor.outputLine();
         }
     };
```
