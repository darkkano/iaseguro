import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('Gateway de IA (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET / explica el flujo', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);
    expect(res.body.name).toContain('Gateway');
  });

  it('POST simple → llama3 (barato)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/completions')
      .send({ prompt: 'Resume este texto: el gato duerme' })
      .expect(200);

    expect(res.body.modelUsed).toBe('llama3');
    expect(res.body.fromCache).toBe(false);
    expect(res.body.output).toContain('el gato duerme');
  });

  it('POST compara → gpt-4o-mini', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/completions')
      .send({ prompt: 'Compara NestJS con Laravel' })
      .expect(200);

    expect(res.body.modelUsed).toBe('gpt-4o-mini');
    expect(res.body.complexityScore).toBeGreaterThanOrEqual(3);
  });

  it('POST analiza → gpt-4o y no filtra PII al modelo (tarjeta tokenizada)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/completions')
      .send({
        prompt: 'Analiza esta arquitectura. El cliente pagó con 4111111111111111',
      })
      .expect(200);

    expect(res.body.modelUsed).toBe('gpt-4o');
    expect(res.body.output).toContain('{{CARD_1}}');
    expect(res.body.output).not.toContain('4111111111111111');
    expect(res.body.redactions).toContain('CARD');
  });

  it('hydrate=true sustituye tokens DESPUÉS del LLM', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/completions')
      .send({
        prompt: 'Saluda a Ana Pérez, email ana@acme.com',
        hydrate: true,
      })
      .expect(200);

    expect(res.body.output).toContain('Ana Pérez');
    expect(res.body.output).toContain('ana@acme.com');
    expect(res.body.outputMasked).toContain('{{NAME_1}}');
    expect(res.body.outputMasked).toContain('{{EMAIL_1}}');
    expect(res.body.redactions).toEqual(
      expect.arrayContaining(['NAME', 'EMAIL']),
    );
  });

  it('segundo request igual → cache hit', async () => {
    const body = { prompt: 'Resume este texto: cache-demo-unico' };

    await request(app.getHttpServer()).post('/v1/completions').send(body);
    const res = await request(app.getHttpServer())
      .post('/v1/completions')
      .send(body)
      .expect(200);

    expect(res.body.fromCache).toBe(true);
    expect(res.body.usage.usd).toBe(0);
  });

  it('API key → 422 BlockedPiiError', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/completions')
      .send({ prompt: 'usa sk-abcdefghij' })
      .expect(422);

    expect(res.body.error).toBe('BlockedPiiError');
  });
});
