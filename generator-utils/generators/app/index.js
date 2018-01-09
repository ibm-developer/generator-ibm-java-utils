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
const configmodule = require('ibm-java-codegen-common').config
const javagen = require('generator-ibm-java')
const javadefaults = javagen.defaults
const handlebars = require('handlebars')

module.exports = class extends Generator {

  initializing() {
    let defaults = new javadefaults()
    defaults.setOptions(this)
    this.data = new configmodule(defaults)
    this.promptmgr = new promptmanager(this.data)
    this.promptmgr.add('testprompt')
    javagen.prompts.forEach(prompt => {
      this.promptmgr.add(prompt);
    })
  }

  prompting() {
    let qns = this.promptmgr.getQuestions()
    return this.prompt(this.promptmgr.getQuestions()).then((answers) => {
        this.promptmgr.afterPrompt(answers, this.data)
    })
  }

  configuring() {
    this.data.bluemix = JSON.stringify(this.data.bluemix)
  }

  writing() {
    let template = this.fs.read(this.templatePath('generationscript.txt'));
    let outfile = this.destinationPath('generated/generationscript.txt');
    let compiledTemplate = handlebars.compile(template);
    let output = compiledTemplate(this.data);
    this.fs.write(outfile, output);
  }
}