/**
* ownCloud
*
* @author Vincent Petry
* @copyright 2014 Vincent Petry <pvince81@owncloud.com>
*
* This library is free software; you can redistribute it and/or
* modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
* License as published by the Free Software Foundation; either
* version 3 of the License, or any later version.
*
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU AFFERO GENERAL PUBLIC LICENSE for more details.
*
* You should have received a copy of the GNU Affero General Public
* License along with this library.  If not, see <http://www.gnu.org/licenses/>.
*
*/
describe('Core base tests', function() {
	describe('Base values', function() {
		it('Sets webroots', function() {
			expect(OC.webroot).toBeDefined();
			expect(OC.appswebroots).toBeDefined();
		});
	});
	describe('Link functions', function() {
		var TESTAPP = 'testapp';
		var TESTAPP_ROOT = OC.webroot + '/appsx/testapp';

		beforeEach(function() {
			OC.appswebroots[TESTAPP] = TESTAPP_ROOT;
		});
		afterEach(function() {
			// restore original array
			delete OC.appswebroots[TESTAPP];
		});
		it('Generates correct links for core apps', function() {
			expect(OC.linkTo('core', 'somefile.php')).toEqual(OC.webroot + '/core/somefile.php');
			expect(OC.linkTo('admin', 'somefile.php')).toEqual(OC.webroot + '/admin/somefile.php');
		});
		it('Generates correct links for regular apps', function() {
			expect(OC.linkTo(TESTAPP, 'somefile.php')).toEqual(OC.webroot + '/index.php/apps/' + TESTAPP + '/somefile.php');
		});
		it('Generates correct remote links', function() {
			expect(OC.linkToRemote('webdav')).toEqual(window.location.protocol + '//' + window.location.host + OC.webroot + '/remote.php/webdav');
		});
		describe('Images', function() {
			it('Generates image path with given extension', function() {
				var svgSupportStub = sinon.stub(window, 'SVGSupport', function() { return true; });
				expect(OC.imagePath('core', 'somefile.jpg')).toEqual(OC.webroot + '/core/img/somefile.jpg');
				expect(OC.imagePath(TESTAPP, 'somefile.jpg')).toEqual(TESTAPP_ROOT + '/img/somefile.jpg');
				svgSupportStub.restore();
			});
			it('Generates image path with svg extension when svg support exists', function() {
				var svgSupportStub = sinon.stub(window, 'SVGSupport', function() { return true; });
				expect(OC.imagePath('core', 'somefile')).toEqual(OC.webroot + '/core/img/somefile.svg');
				expect(OC.imagePath(TESTAPP, 'somefile')).toEqual(TESTAPP_ROOT + '/img/somefile.svg');
				svgSupportStub.restore();
			});
			it('Generates image path with png ext when svg support is not available', function() {
				var svgSupportStub = sinon.stub(window, 'SVGSupport', function() { return false; });
				expect(OC.imagePath('core', 'somefile')).toEqual(OC.webroot + '/core/img/somefile.png');
				expect(OC.imagePath(TESTAPP, 'somefile')).toEqual(TESTAPP_ROOT + '/img/somefile.png');
				svgSupportStub.restore();
			});
		});
	});
	describe('Query string building', function() {
		it('Returns empty string when empty params', function() {
			expect(OC.buildQueryString()).toEqual('');
			expect(OC.buildQueryString({})).toEqual('');
		});
		it('Encodes regular query strings', function() {
			expect(OC.buildQueryString({
				a: 'abc',
				b: 'def'
			})).toEqual('a=abc&b=def');
		});
		it('Encodes special characters', function() {
			expect(OC.buildQueryString({
				unicode: '汉字',
			})).toEqual('unicode=%E6%B1%89%E5%AD%97');
			expect(OC.buildQueryString({
			   	b: 'spaace value',
			   	'space key': 'normalvalue',
			   	'slash/this': 'amp&ersand'
			})).toEqual('b=spaace%20value&space%20key=normalvalue&slash%2Fthis=amp%26ersand');
		});
		it('Encodes data types and empty values', function() {
			expect(OC.buildQueryString({
				'keywithemptystring': '',
			   	'keywithnull': null,
			   	'keywithundefined': null,
				something: 'else'
			})).toEqual('keywithemptystring=&keywithnull&keywithundefined&something=else');
			expect(OC.buildQueryString({
			   	'booleanfalse': false,
				'booleantrue': true
			})).toEqual('booleanfalse=false&booleantrue=true');
			expect(OC.buildQueryString({
			   	'number': 123,
			})).toEqual('number=123');
		});
	});
	describe('Parse query string', function() {
		it('Parses query string from full URL', function() {
			var query = OC.parseQueryString('http://localhost/stuff.php?q=a&b=x');
			expect(query).toEqual({q: 'a', b: 'x'});
		});
		it('Parses query string from query part alone', function() {
			var query = OC.parseQueryString('q=a&b=x');
			expect(query).toEqual({q: 'a', b: 'x'});
		});
		it('Returns null hash when empty query', function() {
			var query = OC.parseQueryString('');
			expect(query).toEqual(null);
		});
		it('Returns empty hash when empty query with question mark', function() {
			var query = OC.parseQueryString('?');
			expect(query).toEqual({});
		});
		it('Decodes regular query strings', function() {
			var query = OC.parseQueryString('a=abc&b=def');
			expect(query).toEqual({
				a: 'abc',
				b: 'def'
			});
		});
		it('Ignores empty parts', function() {
			var query = OC.parseQueryString('&q=a&&b=x&');
			expect(query).toEqual({q: 'a', b: 'x'});
		});
		it('Ignores lone equal signs', function() {
			var query = OC.parseQueryString('&q=a&=&b=x&');
			expect(query).toEqual({q: 'a', b: 'x'});
		});
		it('Includes extra equal signs in value', function() {
			var query = OC.parseQueryString('u=a=x&q=a=b');
			expect(query).toEqual({u: 'a=x', q: 'a=b'});
		});
		it('Decodes plus as space', function() {
			var query = OC.parseQueryString('space+key=space+value');
			expect(query).toEqual({'space key': 'space value'});
		});
		it('Decodes special characters', function() {
			var query = OC.parseQueryString('unicode=%E6%B1%89%E5%AD%97');
			expect(query).toEqual({unicode: '汉字'});
			query = OC.parseQueryString('b=spaace%20value&space%20key=normalvalue&slash%2Fthis=amp%26ersand');
			expect(query).toEqual({
				 b: 'spaace value',
				 'space key': 'normalvalue',
				 'slash/this': 'amp&ersand'
			});
		});
		it('Decodes empty values', function() {
			var query = OC.parseQueryString('keywithemptystring=&keywithnostring');
			expect(query).toEqual({
				'keywithemptystring': '',
				'keywithnostring': null
			});
		});
		it('Does not interpret data types', function() {
			var query = OC.parseQueryString('booleanfalse=false&booleantrue=true&number=123');
			expect(query).toEqual({
				'booleanfalse': 'false',
				'booleantrue': 'true',
				'number': '123'
			});
		});
	});
});
