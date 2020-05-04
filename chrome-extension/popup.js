// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';


chrome.storage.sync.get('toggle', function(data) {
	var state = data.toggle == 'on' ? true : false;
	$('#toggle-trigger').prop('checked', state).change();  
});



$('#toggle-trigger').change(function() {
	var state = $(this).prop('checked') == true ? 'on' : 'off';
	  chrome.storage.sync.set({toggle: state}, function() {
	    console.log('Switch: ' + state);
	  })


})
