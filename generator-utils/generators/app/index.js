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
const process = require('process')
const path = require('path')
const fs = require('fs')

module.exports = class extends Generator {

  constructor (args, opts) {
    super(args, opts)
    this.option("data", { desc : 'A data file to use instead of prompts', type: String, default: undefined});
  }

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
    this.useDataFile = this.options.data !== undefined;
  }

  prompting() {
    if(!this.useDataFile) {
      //no data file supplied, so prompt the user
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
  }

  configuring() {
    if(this.useDataFile) {  //use the data from the file
      let fullpath = path.isAbsolute(this.options.data) ? this.options.data : path.resolve(process.cwd(), this.options.data);
      let contents = fs.readFileSync(fullpath, 'utf8');
      this.data = JSON.parse(contents);
    } else {                //configure based on the answers to questions
      if(this.responses.bluemix) {
        console.log(this.data)
        this.responses.bluemix.backendPlatform = this.data.createType.endsWith('/liberty') === 'liberty' ? 'JAVA' : 'SPRING'
        this.responses.bluemix = '"' + JSON.stringify(this.responses.bluemix).replace(/"/g, '\\"') + '"'
      }
    }
  }

  writing() {
    //write out the executable script file
    let ext = process.platform.startsWith('win') ? '.bat' : '.sh';
    this._processTemplate('yojava.template', 'generated/yojava' + ext, this.data);
    //now do the data this was used to generate the script from
    this._processTemplate('data.template', 'generated/data.json', JSON.stringify(this.data, null, '\t'));
    fs.chmodSync(this.destinationPath('generated/yojava' + ext), 0o777);
  }

  _processTemplate(srcpath, destpath, data) {
    let template = this.fs.read(this.templatePath(srcpath));
    let outfile = this.destinationPath(destpath);
    let compiledTemplate = handlebars.compile(template);
    let output = compiledTemplate(data);
    this.fs.write(outfile, output); 
  }
}
