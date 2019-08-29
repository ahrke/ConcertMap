/* eslint no-undef: 0 */
const postObj = async (url, data) => {
  if (isNaN(data.start_date)) data.start_date = new Date(data.start_date).getTime();
  const res = await fetch(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  const resObj = await (res.json());
  if (!resObj) throw new Error(`POST to ${url} failed`);
};

const getEvents = async (url, data) => {
  const res = await fetch(
  );
};

export { postObj };
