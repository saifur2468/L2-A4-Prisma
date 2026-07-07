import app from './app';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  app.listen(PORT, () => {
    console.log(` RentNest Server is running on port ${PORT}`);
  });
}

bootstrap();