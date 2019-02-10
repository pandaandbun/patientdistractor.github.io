var _solace =







solace,SolclientFactory = _solace.SolclientFactory,SDTField = _solace.SDTField,SDTFieldType = _solace.SDTFieldType,Session = _solace.Session,StatType = _solace.StatType,SessionEventCode = _solace.SessionEventCode,TransportProtocol = _solace.TransportProtocol;var

createSession =


SolclientFactory.createSession,createTopicDestination = SolclientFactory.createTopicDestination,createMessage = SolclientFactory.createMessage;var _ref =


SolaceCloud || {},getCurrentService = _ref.getCurrentService;

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


      publish: {
        form: {
          topic: 'try-me',
          message: 'play vr',
          format: 'binaryAttachment',
          button: {
            publish: 'Publish' } },


        status: {
          show: false,
          message: '' } } },




    connected: false,
    session: null,
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
      this.connected = false;
    },

    // Connect the session.
    connect: function connect() {var _this = this;
      if (this.session) this.reset();

      // Create a session with the given session properties
      try {
        this.session = createSession(this.tabs.session.form);
      } catch (ex) {
        this.setStatus('session', 'Error creating session: ' + ex.message);
        return;
      }

      this.session.on(SessionEventCode.UP_NOTICE, function () {
        _this.sessionRequestCompleted();
        _this.connected = true;
        _this.setActiveTab('publish');
      });
      this.session.on(SessionEventCode.DISCONNECTED, function () {
        _this.sessionRequestCompleted();
        _this.reset();
      });
      this.session.on(SessionEventCode.DOWN_ERROR, function () {for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}
        console.log('DOWN_ERROR', args);
        _this.setStatus('session', 'Session down with error ' + event);
        _this.reset();
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

    // Publish a message.
    // It is safe to publish arbitrary data, including text in the message's 
    // binaryAttachment, but using an SDT String field adds metadata to help 
    // identify the message content.
    publish: function publish() {var
      session = this.session;var
      form = this.tabs.publish.form;
      var message = createMessage();
      if (form.format == 'binaryAttachment') {
        message.setBinaryAttachment(form.message);
      } else {
        message.setSdtContainer(SDTField.create(SDTFieldType.STRING, form.message));
      }

      try {
        message.setDestination(createTopicDestination(form.topic));
        session.send(message);
      } catch (ex) {
        this.setStatus('publish', 'Publish error: ' + ex.message);
        return;
      }
      this.setStatus('publish', session.getStat(StatType.TX_DIRECT_MSGS) + ' message(s) published');
    },

    // Pop up a status update.
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

    // Set the active (displayed) UI tab.
    setActiveTab: function setActiveTab(selection) {var _this2 = this;
      Object.keys(this.tabs).forEach(function (tabName) {
        _this2.tabs[tabName].active = tabName === selection;
      });
    },

    // toggle the advanced settings
    toggleAdvancedSettings: function toggleAdvancedSettings() {
      this.showAdvancedSettings = !this.showAdvancedSettings;
    },

    // Accept external session properties.
    setSessionCredentials: function setSessionCredentials(properties) {
      Object.assign(this.tabs.session.form, properties);
    } },



  mounted: function mounted() {
    document.getElementById('vue-loading').remove();
    this.init();
  } });