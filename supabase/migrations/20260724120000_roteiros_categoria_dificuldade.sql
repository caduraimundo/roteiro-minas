ALTER TABLE roteiros
  ADD COLUMN categoria text
    CHECK (categoria IS NULL OR categoria = ANY (ARRAY[
      'trilha', 'cachoeira', 'travessia', 'cultural'
    ])),
  ADD COLUMN nivel_dificuldade text
    CHECK (nivel_dificuldade IS NULL OR nivel_dificuldade = ANY (ARRAY[
      'leve', 'moderado', 'dificil', 'extremo'
    ]));

COMMENT ON COLUMN roteiros.categoria IS
  'Categoria do roteiro (trilha/cachoeira/travessia/cultural) - opcional, NULL nos roteiros criados antes desse campo existir.';
COMMENT ON COLUMN roteiros.nivel_dificuldade IS
  'Nível de dificuldade do passeio (leve/moderado/dificil/extremo) - opcional, NULL nos roteiros criados antes desse campo existir.';
