// importere chai og chai-http til at teste API'et
import {use} from 'chai';
import chaiHttp from 'chai-http';
import server from '../index.js';

let chai = use(chaiHttp);

let expect = chai.expect;

// Test af API'et for at logge ind
describe('Logind', () => {
  // Setup af korrekt udfyld brugernavn og kodeord
  let korrektUdfyld = { Brugernavn: 'test', Kodeord: 'test' };

  // Test af at logge ind med korrekt brugernavn og kodeord (exercise)
  it('Korrekt udfyld brugernavn og kodeord', (done) => {
      // Sender en POST request til serveren med brugernavn og kodeord
      chai.request(server)
          .post('/logindApi/logind')
          .send(korrektUdfyld)
          .end((err, response) => {
            // Forventer at responsen er 200 og at responsen er en objekt samt en besked om at brugeren er fundet (verify)
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.have.property('message').eql('Bruger fundet');
            done();
          });
  });

  // Setup af forkert udfyld kodeord
  let forkertUdfyldKodeord = { Brugernavn: 'test', Kodeord: 'fejl' };

  // Test af at logge ind med forkert kodeord (exercise)
  it('Kodeord er forkert', (done) => {

      // Sender en POST request til serveren med brugernavn og kodeord
      chai.request(server)
          .post('/logindApi/logind')
          .send(forkertUdfyldKodeord)
          .end((err, response) => {
            // Forventer at responsen er 500 og at responsen er en objekt samt en besked om at brugernavn eller kodeord er forkert (verify)
            expect(response).to.have.status(500);
            expect(response.body).to.be.a('object');
            expect(response.body).to.have.property('error').eql('Forkert brugernavn eller kode');              
            done();
          });
  });

  let forkertUdfyldBrugernavn = { Brugernavn: 'fejl', Kodeord: 'test' };

  // Test af at logge ind med forkert brugernavn (exercise)
  it('Brugernavn er forkert', (done) => {
      // Sender en POST request til serveren med brugernavn og kodeord
      chai.request(server)
        .post('/logindApi/logind')
        .send(forkertUdfyldBrugernavn)
        .end((err, response) => {
          // Forventer at responsen er 500 og at responsen er en objekt samt en besked om at brugernavn eller kodeord er forkert (verify)
          expect(response).to.have.status(500);
          expect(response.body).to.be.a('object');
          expect(response.body).to.have.property('error').eql('Forkert brugernavn eller kode');              
          done();
        });
  });

  // Setup af forkert udfyld brugernavn og kodeord
  let forkertUdfyld = { Brugernavn: 'fejl', Kodeord: 'fejl' };

  // Test af at logge ind med forkert brugernavn og kodeord (exercise)
  it('Både Brugernavn og kodeord er forkert', (done) => {
    // Sender en POST request til serveren med brugernavn og kodeord
    chai.request(server)
      .post('/logindApi/logind')
      .send(forkertUdfyld)
      .end((err, response) => {
        // Forventer at responsen er 500 og at responsen er en objekt samt en besked om at brugernavn eller kodeord er forkert (verify)
        expect(response).to.have.status(500);
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('error').eql('Forkert brugernavn eller kode');              
        done();
      });
});
});
