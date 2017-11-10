/*
    Copyright 2017 SilverTuxedo

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

 */

"use strict";


//function to call instead of the function that sends the typing indication
function altFunctionForTypingSenderFxPlusplus()
{
    console.log("prevented sending typing packet")
}

//find functions that send typing indications and override them
if (window.sendUserIsTypingInShowthread)
    window.sendUserIsTypingInShowthread = altFunctionForTypingSenderFxPlusplus;
if (window.typeingsend)
    window.typeingsend = altFunctionForTypingSenderFxPlusplus;