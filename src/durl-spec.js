const whatwgUrl = require('whatwg-url');
if (typeof URL === 'undefined') { global.URL = whatwgUrl.URL; }
if (typeof URLSearchParams === 'undefined') { global.URLSearchParams = whatwgUrl.URLSearchParams; }

const { expect } = require('chai');
require('chai').should();
const PostMassage = require('post-massage');
const Durl = require('./durl');

// TODO this mock is getting to elaborate, surely theres
// another framework to get true windows and such.
window = {
  lastMessage: undefined,
  postMessage(msg, origin) {
    window.lastMessage = msg;
    window.lastOrigin = origin;
  },
  addEventListener(event, handler) {
    window.eventListener = { event, handler };
  },
  document: { body: { onhashchange: {} } },
  location: { href: 'https://localhost/' }
};

location = {
  href: 'https://localhost/',
  replace(url) { this.href = url; }
};

const makeDurl = (pmb) => new Durl({ postMassage: pmb });

describe('Durl', function() {
  let pmb;

  beforeEach(function() {
    location.href = 'https://localhost/';
    window.location.href = 'https://localhost/';
    pmb = new PostMassage({ window, namespace: 'foobar', addListener: false });
  });

  it.skip('should be tested more', function() {
    const test = makeDurl(pmb);
    expect(true).to.equal(true);
  });

  describe('#getDeepPath', function() {
    it('returns empty string when no durl in hash', function() {
      expect(makeDurl(pmb).getDeepPath()).to.equal('');
    });

    it('returns decoded durl from hash', function() {
      location.href = 'https://localhost/#?durl=https%3A%2F%2Fexample.com%2Fpath';
      expect(makeDurl(pmb).getDeepPath()).to.equal('https://example.com/path');
    });

    it('stops reading durl at the next hash param', function() {
      location.href = 'https://localhost/#?durl=https%3A%2F%2Fexample.com&other=1';
      expect(makeDurl(pmb).getDeepPath()).to.equal('https://example.com');
    });
  });

  describe('#setDURL', function() {
    it('adds durl to an empty hash', function() {
      makeDurl(pmb).setDURL('https%3A%2F%2Fexample.com%2F');
      expect(location.href).to.include('durl=https%3A%2F%2Fexample.com%2F');
    });

    it('updates an existing durl in the hash', function() {
      location.href = 'https://localhost/#?durl=oldvalue';
      makeDurl(pmb).setDURL('newvalue');
      expect(location.href).to.include('durl=newvalue');
      expect(location.href).to.not.include('oldvalue');
    });

    it('does not update location when durl is unchanged', function() {
      location.href = 'https://localhost/#?durl=samevalue';
      const before = location.href;
      makeDurl(pmb).setDURL('samevalue');
      expect(location.href).to.equal(before);
    });

    it('preserves other hash params when updating durl', function() {
      location.href = 'https://localhost/#?other=1&durl=old';
      makeDurl(pmb).setDURL('new');
      expect(location.href).to.include('other=1');
      expect(location.href).to.include('durl=new');
    });
  });
});

describe('Durl.stripDeepUrl', function() {
  it('removes durl from query string', function() {
    const stripped = Durl.stripDeepUrl('https://example.com/path?durl=%2Fadmin%2Ftablets&foo=bar', 'durl');
    expect(stripped).to.not.include('durl=');
    expect(stripped).to.include('foo=bar');
  });

  it('removes durl from hash query', function() {
    const stripped = Durl.stripDeepUrl('https://example.com/path#?durl=%2Fadmin%2Ftablets&x=1', 'durl');
    expect(stripped).to.not.include('durl=');
    expect(stripped).to.include('#?x=1');
  });

  it('does not double-encode encoded slashes', function() {
    const payload = encodeURIComponent(Durl.stripDeepUrl('https://example.com/path?durl=%2Fadmin%2Ftablets', 'durl'));
    expect(payload).to.not.include('%252F');
  });

  it('leaves url without durl unchanged except normalization', function() {
    const stripped = Durl.stripDeepUrl('https://example.com/path?foo=1', 'durl');
    expect(stripped).to.include('foo=1');
  });

  it('removes multiple durl occurrences', function() {
    const stripped = Durl.stripDeepUrl('https://example.com/path?durl=%2Fone&durl=%2Ftwo&bar=1', 'durl');
    expect(stripped).to.not.include('durl=');
    expect(stripped).to.include('bar=1');
  });

  it('removes the query string when durl is the only param', function() {
    const stripped = Durl.stripDeepUrl('https://example.com/path?durl=%2Fadmin', 'durl');
    expect(stripped).to.not.include('?');
  });

  it('removes hash when durl is the only hash param', function() {
    const stripped = Durl.stripDeepUrl('https://example.com/path#?durl=%2Fadmin', 'durl');
    expect(stripped).to.not.include('#');
  });

  it('supports a custom deep_url_var_name', function() {
    const stripped = Durl.stripDeepUrl('https://example.com/path?deeplink=%2Fpath&other=1', 'deeplink');
    expect(stripped).to.not.include('deeplink=');
    expect(stripped).to.include('other=1');
  });
});

