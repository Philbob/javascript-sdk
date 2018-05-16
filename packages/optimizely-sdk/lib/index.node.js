/****************************************************************************
 * Copyright 2016-2017, Optimizely, Inc. and contributors                   *
 *                                                                          *
 * Licensed under the Apache License, Version 2.0 (the "License");          *
 * you may not use this file except in compliance with the License.         *
 * You may obtain a copy of the License at                                  *
 *                                                                          *
 *    http://www.apache.org/licenses/LICENSE-2.0                            *
 *                                                                          *
 * Unless required by applicable law or agreed to in writing, software      *
 * distributed under the License is distributed on an "AS IS" BASIS,        *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *
 * See the License for the specific language governing permissions and      *
 * limitations under the License.                                           *
 ***************************************************************************/

/**
 * Entry point for nodejs environment
 * @module
 */

var configValidator = require('./utils/config_validator');
var defaultErrorHandler = require('./plugins/error_handler');
var defaultEventDispatcher = require('./plugins/event_dispatcher/index.node');
var enums = require('./utils/enums');
var fns = require('./utils/fns');
var jsonSchemaValidator = require('./utils/json_schema_validator');
var logger = require('./plugins/logger');
var sprintf = require('sprintf');

var Optimizely = require('./optimizely');

var MODULE_NAME = 'INDEX';

module.exports = {
  /**
   * Creates an instance of the Optimizely class
   * @param  {Object} config
   * @param  {String} config.datafile Datafile string. Should conform to [schema]{@link module:optimizely/project_config_schema}
   * @param  {ErrorHandler|undefined} config.errorHandler Error Handler
   * @param  {EventDispatcher|undefined} config.eventDispatcher Custom Event Dispatcher, if any
   * @param  {JSONSchemaValidator|undefined} config.jsonSchemaValidator
   * @param  {Logger|undefined} config.logger Custom logger (if not specified, will use default logger)
   * @param  {UserProfileService|undefined} config.userProfileService User Profile service to configure, if any
   * @return {module:optimizely/index~Optimizely} the Optimizely object
   */
  createInstance: function (config) {
    var defaultLogger = logger.createNoOpLogger();
    if (config) {
      try {
        configValidator.validate(config);
        config.isValidInstance = true;
      } catch (ex) {
        if (config.logger) {
          config.logger.log(enums.LOG_LEVEL.ERROR, sprintf('%s: %s', MODULE_NAME, ex.message));
        } else {
          var simpleLogger = logger.createLogger({
            logLevel: 4
          });
          simpleLogger.log(enums.LOG_LEVEL.ERROR, sprintf('%s: %s', MODULE_NAME, ex.message));
        }
        config.isValidInstance = false;
      }
    }

    config = fns.assign({
      clientEngine: enums.NODE_CLIENT_ENGINE,
      clientVersion: enums.CLIENT_VERSION,
      errorHandler: defaultErrorHandler,
      eventDispatcher: defaultEventDispatcher,
      jsonSchemaValidator: jsonSchemaValidator,
      logger: defaultLogger,
      skipJSONValidation: false
    }, config);

    return new Optimizely(config);
  }
};
