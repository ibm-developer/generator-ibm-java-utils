/*
 * Copyright IBM Corporation 2018
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

const Generator = require('yeoman-generator')
const promptmanager = require('../lib/promptmgr')
const common = require('ibm-java-codegen-common')
const java = require('generator-ibm-java')
const spring = require('generator-ibm-java-spring')
const liberty = require('generator-ibm-java-liberty')
const handlebars = require('handlebars')
const fs = require('fs');

module.exports = class extends Generator {

  initializing() {
    this._initializeData([new java.defaults(), new spring.defaults(), new liberty.defaults()])

    this.promptmgr = new promptmanager(this.data)
    let context = new common.context('utils', this.data, this.promptmgr)

    this._addPrompts(java.prompts)
    this._addPrompts(spring.prompts, context)
    this._addPrompts(liberty.prompts, context)
  }

  _initializeData(defaultObjects) {
    this.defaults = {}
    defaultObjects.forEach(obj => {
      let keys = obj.get()
      keys.forEach(key => {
        if(this.defaults[key]) {
          throw new Error('Default value for ' + key + ' has already been provided')
        }
        this.defaults[key] = obj.getObject(key)
      })
    })
    let defaultsObject = new common.defaults(this.defaults)
    defaultsObject.setOptions(this)
    this.data = new common.config(defaultsObject)
  }

  _addPrompts(prompts, context) {
    prompts.forEach(prompt => {
      let ext = this.promptmgr.add(prompt)
      if(context) {
        ext.setContext(context)
      }
    })
  }

  prompting() {
    let qns = this.promptmgr.getQuestions()
    return this.prompt(this.promptmgr.getQuestions()).then((answers) => {
        this.promptmgr.afterPrompt(answers, this.data)
        this.responses = {}
        for(let key in answers) {
          if(this.defaults[key]) {
            this.responses[key] = this.data[key]
          }
        }
    })
  }

  configuring() {
    if(this.responses.bluemix) {
      console.log(this.data)
      this.responses.bluemix.backendPlatform = this.data.createType.endsWith('/liberty') === 'liberty' ? 'JAVA' : 'SPRING'
      this.responses.bluemix = '"' + JSON.stringify(this.responses.bluemix).replace(/"/g, '\\"') + '"'
    }
  }

  writing() {
    let template = this.fs.read(this.templatePath('generationscript.txt'));
    let outfile = this.destinationPath('generated/generationscript.sh');
    let compiledTemplate = handlebars.compile(template);
    let output = compiledTemplate(this.responses);
    this.fs.write(outfile, output);
    console.log(output)
  }

  end() {
    fs.chmodSync(this.destinationPath('generated/generationscript.sh'), 0o777)
  }
}