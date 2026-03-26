import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static('public'));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});