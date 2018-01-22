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

const fileLocation = 'generated/generationscript.sh';

class Options {
  constructor() {
    this.prompts = {}
  }

  before() {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts(this.prompts)
      .toPromise()
  }
}

describe('generator-ibm-java', function() {
  describe('Generates a file with the correct defaults', function() {
    let defaults = new java.defaults()
    let keys = defaults.get()
    let prompts = {promptType: 'prompt:patterns'}
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
      if(key === 'debug' || key === 'version' || key === 'frameworkType' || key === 'headless') {
        return;
      }
      it('default ' + key + ' is set to ' + value, function() {
        assert.fileContent(fileLocation, '--' + key + '=' + value)
      })
    })
    it('does not include a setting for technologies', function() {
      assert.noFileContent(fileLocation, '--technologies')
    })
    it('has correct file permissions', function() {
      fs.accessSync(fileLocation, fs.constants.R_OK | fs.constants.W_OK | fs.constants.X_OK)
    })
  })
  describe('Generates a file with correct values chosen', function() {
    let prompts = {promptType: 'prompt:patterns', createType: 'blank/spring',
      buildType: 'gradle', appName: 'testname', groupId: 'testgroupid', artifactId: 'testartifactid',
      services: 'cloudant', bluemix: ''}
    const options = new Options()
    options.prompts = prompts
    before(options.before.bind(options))
    for(let prompt in prompts) {
      if(prompt !== 'services' && prompt !== 'bluemix') {
        it(prompt + ' value is set to ' + prompts[prompt], function() {
        assert.fileContent(fileLocation, '--' + prompt + '=' + prompts[prompt])
        })
      }
    }
    it('bluemix is value includes the name and cloudant', function() {
      assert.fileContent(fileLocation,
        '--bluemix="{\\"server\\":{\\"name\\":\\"testname\\",\\"host\\":\\"host\\",\\"domain\\":\\"mybluemix.net\\",\\"services\\":\\"cloudant\\"},\\"backendPlatform\\":\\"SPRING\\"}"')
    })
  })
})