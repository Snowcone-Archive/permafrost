// ZodRedis implements using zod schemas for serializing and deserializing to Redis (or Redis compatible)
// The implementation is a simplified version of nkeil's zod-redis: https://github.com/nkeil/zod-redis

import { Redis, type RedisOptions } from "ioredis";
import superjson from "superjson";
import * as z from "zod/v4";
import { error, warn } from "./logger";

type ZodRedisOptions = RedisOptions & {
  schema: Schema;
};
type Schema = Record<string, SchemaModel>;
type SchemaModel = {
  zod: z.ZodTypeAny;
  expirationSeconds: number;
  getKey?: (...args: any[]) => string;
};

type ModelName<TSchema extends Schema> = keyof TSchema;
// type Key<TModel extends SchemaModel> = ReturnType<TModel["getKey"]>;
type Key<TModel extends SchemaModel> = TModel["getKey"] extends (
  ...args: any[]
) => any
  ? ReturnType<TModel["getKey"]>
  : string;
type Value<TModel extends SchemaModel> = z.output<TModel["zod"]>;

type GetSchema<TOptions extends ZodRedisOptions> = TOptions extends {
  schema: infer TSchema;
}
  ? TSchema extends Schema
    ? TSchema
    : Record<string, never>
  : Record<string, never>;

export class ZodRedis<
  TOptions extends ZodRedisOptions,
  TSchema extends Schema = GetSchema<TOptions>,
> extends Redis {
  private schema: TSchema;

  constructor(url: string, options: TOptions) {
    super(url, options);
    // this.schema = options.schema as TSchema;
    this.schema = Object.fromEntries(
      Object.entries(options.schema).map(([modelName, model]) => {
        const getKey = model.getKey ?? ((id: string) => `${modelName}:${id}`);
        return [modelName, { ...model, getKey }];
      })
    ) as TSchema;
  }

  model<TModel extends ModelName<TSchema>>(model: TModel) {
    if (!this.schema?.[model]) {
      throw new Error("Tried to access a nonexistent model!");
    }
    return new Model(this, this.schema[model]);
  }
}

class Model<TModel extends SchemaModel> {
  public getKey: TModel["getKey"];

  constructor(
    private redis: Redis,
    private model: TModel
  ) {
    this.getKey = model.getKey;
  }

  /**
   * Create or update a model instance.
   * @param model The name of the model you are querying for
   * @param key A string targeting the specific model instance
   * @param value The value you will be storing under `key`
   */
  async set(key: Key<TModel>, value: Value<TModel>) {
    try {
      const result = await this.redis.set(key, superjson.stringify(value));
      await this.redis.expire(key, this.model.expirationSeconds);
      return result;
    } catch (e) {
      error("Error in redis model.set", e);
      return;
    }
  }

  /**
   * Retrieve a model instance.
   * @param model The name of the model you are querying for
   * @param key A string targeting the specific model instance
   */
  async get(key: Key<TModel>) {
    try {
      const zodString = await this.redis.get(key);
      if (!zodString) return null;
      const zodResponse = this.model.zod.safeParse(superjson.parse(zodString));
      if (!zodResponse.success) return null;
      return zodResponse.data as Value<TModel>;
    } catch (e) {
      warn("Error in `redis.get`. Gracefully returning null.", e);
      return null;
    }
  }

  async delete(key: Key<TModel>) {
    try {
      await this.redis.del(key);
    } catch (e) {
      warn("Error in `redis.delete`. Gracefully doing nothing.", e);
    }
  }
}
