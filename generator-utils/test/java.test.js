/*
 * Copyright IBM Corporation 2017
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

// Tests the ibm-java prompts

const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const path = require('path');
const java = require('generator-ibm-java')
const fs = require('fs')

const SH_FILE = 'generated/yojava.sh'
const DATA_FILE = 'generated/data.json'
const SCAFF_FILE = 'generated/scaffolder.json'
const SCAFF_DEFAULT_CONTENTS = require(path.resolve('test/resources/scaffolder-default.json'))
const SCAFF_CONTENTS = require(path.resolve('test/resources/scaffolder.json'))

class Options {
  constructor() {
    this.prompts = {}
    this.options = {}
  }

  before() {
    this.prompts.promptType = 'prompt:patterns'
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts(this.prompts)
      .withOptions(this.options)
      .toPromise()
  }
}

describe('generator-ibm-java', function() {
  describe('Generates a file with the correct defaults', function() {
    let defaults = new java.defaults()
    let keys = defaults.get()
    let prompts = {}
    keys.forEach(key => {
      let value = defaults.get(key)
      prompts[key] = value
    })
    const options = new Options()
    options.prompts = prompts
    before(options.before.bind(options))
    keys.forEach(key => {
      let value = defaults.get(key)
      if(value === undefined) {
        return;
      }
      if(key === 'bluemix') {
        value = '"' + JSON.stringify(value).replace(/"/g, '\\"') + '"'
      }
      if(key === 'version' || key === 'frameworkType') {
        return;
      }
      it(SH_FILE + ' contents: default ' + key + ' is set to ' + value, function() {
        assert.fileContent(SH_FILE, '--' + key + '=' + value)
      })
    })
    it(SH_FILE + ' contents: does not include a setting for technologies', function() {
      assert.noFileContent(SH_FILE, '--technologies')
    })
    it(SH_FILE + ' has correct file permissions', function() {
      fs.accessSync(SH_FILE, fs.constants.R_OK | fs.constants.W_OK | fs.constants.X_OK)
    })
    it(DATA_FILE + ' contents: contains bluemix object with backendPlatform escaped', function() {
      assert.fileContent(DATA_FILE, '"bluemix": "\\"{')
      assert.fileContent(DATA_FILE, '\\\\\\"backendPlatform\\\\\\":\\\\\\"JAVA\\\\\\"')
    })
    it(SCAFF_FILE + ' content: contains correct data', function() {
      assert.jsonFileContent(SCAFF_FILE, SCAFF_DEFAULT_CONTENTS)
    })

  })
  let checkContents = function() {
    it(SH_FILE + ' contents: bluemix value includes the name, cloudant and backendPlatform', function() {
      assert.fileContent(SH_FILE,
        '--bluemix="{\\"server\\":{\\"name\\":\\"testname\\",\\"host\\":\\"host\\",\\"domain\\":\\"mybluemix.net\\",\\"services\\":[\\"cloudant\\"]},\\"cloudant\\":[{\\"serviceInfo\\":'
          + '{\\"name\\":\\"test-cloudantNoSQLDB-000\\",\\"label\\":\\"cloudantNoSQLDB\\",\\"plan\\":\\"Lite\\"},\\"password\\":\\\"pass\\",\\"url\\":\\"https://account.cloudant.com\\",'
          + '\\"username\\":\\"user\\"}],\\"backendPlatform\\":\\"SPRING\\"}"')
    })
    it(DATA_FILE + ' contents: contains bluemix object with backendPlatform escaped', function() {
      assert.fileContent(DATA_FILE, '"bluemix": "\\"{')
      assert.fileContent(DATA_FILE, '\\\\\\"backendPlatform\\\\\\":\\\\\\"')
    })
  }
  describe('Generates a file with correct values chosen', function() {
    let prompts = {createType: 'blank/spring',
      buildType: 'gradle', appName: 'testname', groupId: 'testgroupid', artifactId: 'testartifactid',
      services: ['cloudant']}
    const options = new Options()
    options.prompts = prompts
    before(options.before.bind(options))
    for(let prompt in prompts) {
      if(prompt !== 'services' && prompt !== 'bluemix') {
        it(SH_FILE + ' contents: ' + prompt + ' value is set to ' + prompts[prompt], function() {
          assert.fileContent(SH_FILE, '--' + prompt + '=' + prompts[prompt])
        })
      }
    }
    checkContents()
    it(SCAFF_FILE + ' content: contains correct data', function() {
      assert.jsonFileContent(SCAFF_FILE, SCAFF_CONTENTS)
    })
  })
  describe('Generates a file with correct values when data is provided', function() {
    const options = new Options()
    options.options.data = path.resolve('test/resources/data.json')
    before(options.before.bind(options))
    checkContents()
  })
})