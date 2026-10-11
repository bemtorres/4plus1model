/** Enlaces oficiales de las tecnologías usadas en el catálogo de ejemplos. */
const TECHNOLOGY_URLS: [RegExp, string][] = [
  [/react/i, "https://react.dev/"],
  [/next\.?js/i, "https://nextjs.org/"],
  [/angular/i, "https://angular.dev/"],
  [/vue/i, "https://vuejs.org/"],
  [/flutter/i, "https://flutter.dev/"],
  [/swift/i, "https://developer.apple.com/swift/"],
  // Los frameworks se comprueban antes que el lenguaje para no perder detalle
  [/spring boot/i, "https://spring.io/projects/spring-boot"],
  [/spring/i, "https://spring.io/"],
  [/laravel/i, "https://laravel.com/"],
  [/nest/i, "https://nestjs.com/"],
  [/monaco/i, "https://microsoft.github.io/monaco-editor/"],
  [/electron/i, "https://www.electronjs.org/"],
  [/webrtc/i, "https://webrtc.org/"],
  [/java\b/i, "https://www.oracle.com/java/"],
  [/kotlin/i, "https://kotlinlang.org/"],
  [/\bgo\b/i, "https://go.dev/"],
  [/rust/i, "https://www.rust-lang.org/"],
  [/python/i, "https://www.python.org/"],
  [/node/i, "https://nodejs.org/"],
  [/elixir/i, "https://elixir-lang.org/"],
  [/ruby/i, "https://www.ruby-lang.org/"],
  [/c\+\+/i, "https://isocpp.org/"],
  [/c#|\.net/i, "https://dotnet.microsoft.com/"],
  [/typescript/i, "https://www.typescriptlang.org/"],
  [/android/i, "https://developer.android.com/"],

  [/postgres/i, "https://www.postgresql.org/"],
  [/clickhouse/i, "https://clickhouse.com/"],
  [/snowflake/i, "https://www.snowflake.com/"],
  [/redis/i, "https://redis.io/"],
  [/opensearch/i, "https://opensearch.org/"],
  [/elasticsearch/i, "https://www.elastic.co/elasticsearch/"],
  [/pgvector/i, "https://github.com/pgvector/pgvector"],
  [/mongo/i, "https://www.mongodb.com/"],
  [/s3\b/i, "https://aws.amazon.com/s3/"],
  [/cdn/i, "https://en.wikipedia.org/wiki/Content_delivery_network"],
  [/sql\b/i, "https://en.wikipedia.org/wiki/SQL"],
  [/odbc/i, "https://learn.microsoft.com/sql/odbc/"],

  [/kafka/i, "https://kafka.apache.org/"],
  [/rabbitmq/i, "https://www.rabbitmq.com/"],
  [/nats/i, "https://nats.io/"],
  [/celery/i, "https://docs.celeryq.dev/"],
  [/airflow/i, "https://airflow.apache.org/"],

  [/grpc/i, "https://grpc.io/"],
  [/graphql/i, "https://graphql.org/"],
  [/rest/i, "https://restfulapi.net/"],
  [/amqp/i, "https://www.rabbitmq.com/amqp.html"],
  [/kafka streams/i, "https://kafka.apache.org/documentation/streams/"],
  [/iso 20022/i, "https://www.iso20022.org/"],
  [/ocpp/i, "https://openchargealliance.org/"],
  [/oauth/i, "https://oauth.net/"],
  [/oidc/i, "https://openid.net/"],
  [/saml/i, "https://www.oasis-open.org/standards/security/wf-v1.1-ws-saml/"],
  [/smtp/i, "https://datatracker.ietf.org/doc/html/rfc5321"],
  [/syslog/i, "https://datatracker.ietf.org/doc/html/rfc5424"],
  [/stun|turn/i, "https://www.rfc-editor.org/rfc/rfc5766"],
  [/rtmp/i, "https://rtmp.veriskope.com/"],
  [/websocket/i, "https://developer.mozilla.org/docs/Web/API/WebSockets"],
  [/https|tls/i, "https://developer.mozilla.org/docs/Web/HTTP"],
  [/json/i, "https://www.json.org/"],
  [/airtable/i, "https://airtable.com/"],
  [/object storage/i, "https://en.wikipedia.org/wiki/Object_storage"],
];

/** URL oficial de una tecnología, si se reconoce. */
export function technologyUrl(name: string): string | undefined {
  for (const [pattern, url] of TECHNOLOGY_URLS) {
    if (pattern.test(name.trim())) return url;
  }
  return undefined;
}
