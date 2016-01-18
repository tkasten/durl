function Durl(options){
  this.options = options || {}
  this.deep_url_var_name = this.options.deep_url_var_name || "durl"
  this.pm = options.postMassage

  if(!this.pm){
    this.pm = new PostMassage({namespace: 'durl'})
  }
  this.pm.bind('setDURL', this.setDURL)
  this.pm.bind('setDURLFromConsumer', this.setDURLFromConsumer)
  
  this.options.producer ? this.bootAsProducer() : this.bootAsConsumer()
}

Durl.prototype.bootAsProducer = function(){
  if(window != parent.window){
    this.log("booting")
    this.pm.call('setDURL', encodeURIComponent(window.location.href))
    var self = this
    $(document).ready(function(){
      if("onhashchange" in window.document.body){
        window.addEventListener("hashchange", function(){
          this.pm.call('setDURL', encodeURIComponent(window.location.href))
        })
      }
    })
  }else{
    this.log("refusing to boot, no parent window detected")
  }
},

Durl.prototype.bootAsConsumer = function(){
  if("onhashchange" in window.document.body){
    var self = this
    window.addEventListener("hashchange", function(){
      var durl = this.getDeepPath()
      this.log('sendDURLFromConsumer: ' + durl)
      this.pm.call('setDURLFromConsumer', durl)
    })
  }
}

Durl.prototype.matchDeepPath = function(path) {
  /**
    *
    * DURL will store its durl (deep url) in the consumer's hash fragment in the
    * form of `this.deep_url_var_name=url_encoded_url`
    * 
    * But we don't know how the consumer is using their hash fragment so we try
    * to make safe, unobtrusive assumptions about how to integrate our data into
    * their fragment. Consider the following potential use cases on their end:
    *
    * TKK TODO - spec these cases (also need more cases/clean-up etc)...
    *
    * Hash Bang style followed with traditional path and url variables
    * www.example.com/page/path?var1=stuff#!/some/path?p1=v1&durl=value!&p2=v2z
    * www.example.com/page/path?var1=stuff#!/some/path?p1=v1&durl=value!
    *
    * Same as above case but no consumer variables mixed with durl
    * www.example.com/page/path?vars=stuff#!/some/path?durl=value!
    *
    * No Bang(!) just right into the variables
    * www.example.com/page/path#?p1=v2&durl=value!
    *
    * Same as above but no consumer variables mixed with durl
    * www.example.com/page/path#?durl=value!
    *
    */

  pattern = new RegExp("(\\?|&)" + this.deep_url_var_name + "=([^&\n]*)")
  return pattern.exec(this.vanillaHash()) || '' // [whole match, joiner, url]
}

Durl.prototype.setDURL = function(new_url) {
  new_url = new_url || ''
  hash = this.vanillaHash()

  if(matches = this.matchDeepPath()){
    if(matches[2] == new_url){
      return
    }else{
      whole  = matches[0]
      joiner = matches[1]
      hash   = hash.replace(whole, joiner + this.deep_url_var_name + "=" + new_url)
    }
  }else{
    hash += hash.indexOf('?') == -1 ? '?' : '&'
    hash += this.deep_url_var_name + "=" + new_url
  }

  this.log('replacing location: ' + hash)
  location.replace('#' + hash)
}

Durl.prototype.getDeepPath = function() {
  if(matches = this.matchDeepPath())
    return decodeURIComponent(matches[2])
  else
    return ''
}

Durl.prototype.setDURLFromConsumer = function(path) {
  if(window.location.pathname + window.location.search + window.location.hash != path){
    this.log('setDURLFromConsumer: ' + path)
    window.location.replace(path)
  }else{
    this.log('refusing to change frame location, path is unchanged: ' + path)
  }
}

Durl.prototype.vanillaHash = function() {
  // Note that we don't use location.hash because firefox alone decodes it on read.
  // See http://stackoverflow.com/questions/1703552/encoding-of-window-location-hash
  return location.href.split("#")[1] || ''
}

Durl.prototype.log = function(message){
  if(this.options.logging && window.console){
    loggerId = this.options.producer ? 'producer' : 'consumer'
    console.log('[' + loggerId + '] ' + message)
  }
}

function factory(){
  return Durl
}

if (typeof define === 'function' && define.amd) {
  define([],factory)
} else if (typeof module === 'object' && typeof module.exports === 'object') { //Node for browserfy
  module.exports = factory()
} else {
  window.Durl = window.Durl || factory()
}

