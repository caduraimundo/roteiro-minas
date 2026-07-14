alter table roteiros
  add column slug text not null unique;
