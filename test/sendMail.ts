import {describe} from 'mocha';
import {expect} from 'chai';
import {sendMail} from '../src/api';

const markdown =
  '## Title\n\nThis is a test with a [link](https://datasektionen.se).';
const html =
  '<h2>Title</h2>\n<p>This is a test with a <a href="https://datasektionen.se">link</a>.</p>\n\n';

const baseEmail = {
  from: 'no-reply@datasektionen.se',
  to: 'test@example.com',
  subject: 'Test Subject',
  content: markdown,
  // Using empty template to not have the test be dependent on the default formatting
  template: 'empty',
};

describe('sendMail', () => {
  it('should format markdown to HTML correctly', async () => {
    const result = await sendMail({
      body: JSON.stringify(baseEmail),
    });

    const message = JSON.parse(JSON.parse(result.body).message);
    expect(message.html).to.equal(html);
  });
  it('should accept a single "to" address', async () => {
    const result = await sendMail({
      body: JSON.stringify(baseEmail),
    });

    const message = JSON.parse(JSON.parse(result.body).message);
    expect(message.to).to.eql([{address: 'test@example.com', name: ''}]);
  });
  it('should accept "to" on address format', async () => {
    const result = await sendMail({
      body: JSON.stringify({
        ...baseEmail,
        to: {name: 'Test Name', address: 'test@example.com'},
      }),
    });

    const message = JSON.parse(JSON.parse(result.body).message);
    expect(message.to).to.eql([
      {address: 'test@example.com', name: 'Test Name'},
    ]);
  });
});
