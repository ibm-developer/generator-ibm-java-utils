/*
 * © Copyright IBM Corp. 2017, 2018
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

const PROMPT_ID = 'prompt:test'

function Extension () {
  this.id = PROMPT_ID
}

Extension.prototype.getChoice = function () {
  return {
    name: 'Test: this is a test choice',
    value: PROMPT_ID,
    short: 'Test choice'
  }
}

Extension.prototype.show = function (answers) {
  let result = false
  if (answers) {
    if (answers.promptType) {
      result = (answers.promptType === PROMPT_ID)
    } else {
      result = (this.config.promptType === PROMPT_ID)
    }
  } else {
    result = (this.config.promptType === PROMPT_ID)
  }
  return result
}

Extension.prototype.getQuestions = function () {
  return [{
    when: this.show.bind(this),
    type: 'list',
    name: 'createType',
    message: 'What pattern do you want to generate source for?',
    choices: [{
      name: 'Test : a simple test',
      value: 'test',
      short: 'A simple test'
    }, {
      name: 'Test : another simple test',
      value: 'test1',
      short: 'Another simple test'
    }],
    default: 'test'
  }]
}

Extension.prototype.afterPrompt = function (answers) {
  console.log('answers in test', JSON.stringify(answers));
}

module.exports = exports = Extension
