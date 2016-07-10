define(["require", "exports", "VSS/Utils/Core", "q", "TFS/WorkItemTracking/Services"], function (require, exports, VSS_Utils_Core, Q, Services_1) {
    "use strict";
    var Autosave = (function () {
        function Autosave() {
        }
        Autosave.prototype.initialize = function () {
            var _this = this;
            var deferred = Q.defer();
            Services_1.WorkItemFormService.getService().then(function (workItemFormService) {
                _this._workItemFormService = workItemFormService;
                _this._throttledFieldChangeDelegate = VSS_Utils_Core.throttledDelegate(_this, 2500, function (args) {
                    _this._onFieldChanged(args);
                });
                deferred.resolve(null);
            });
            return deferred.promise;
        };
        Autosave.prototype.register = function () {
            var _this = this;
            VSS.register(VSS.getContribution().id, {
                onFieldChanged: function (args) {
                    _this._throttledFieldChangeDelegate(args);
                }
            });
        };
        Autosave.prototype._onFieldChanged = function (args) {
            var _this = this;
            this._workItemFormService.isNew().then(function (isNew) {
                if (!isNew) {
                    _this._workItemFormService.beginSaveWorkItem(function () { }, function () { });
                }
            });
        };
        return Autosave;
    }());
    exports.Autosave = Autosave;
});
