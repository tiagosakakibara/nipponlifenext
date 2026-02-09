# Sistema de Unificação Automática de Contas

## Como Funciona

Quando um usuário faz login com Google OAuth, o sistema agora:

1. **Detecta** se é um novo login OAuth (perfil criado há menos de 5 segundos)
2. **Procura** por contas existentes com role `admin` ou `photographer`
3. **Compara** usando pontuação:
   - Username similar: +10 pontos (exato) ou +5 pontos (parcial)
   - Nome completo similar: +10 pontos (exato) ou +5 pontos (parcial)
   - É admin: +3 pontos bonus
4. **Unifica** se a pontuação for >= 8:
   - Copia role, nome e avatar da conta original
   - Transfere TODO o conteúdo (posts, gallery, jobs, etc.)
   - Mantém o novo ID OAuth para login futuro

## Exemplo de Uso

### Cenário 1: Usuário já tem conta email/senha

1. Usuário cria conta: `tiagosakakibara@gmail.com` (email/senha)
2. Admin promove para `admin` ou `photographer`
3. Usuário faz login com Google usando o mesmo email
4. ✅ Sistema detecta e unifica automaticamente!

### Cenário 2: Primeiro login é com Google

1. Usuário faz login com Google
2. Conta criada como `user` normal
3. Admin promove para `admin`
4. ✅ Conta funciona normalmente

## Estado Atual

Contas limpas e prontas para teste:

- ✅ Conta duplicada OAuth removida
- ✅ Todo conteúdo restaurado para conta original
- ✅ Sistema de unificação implementado

## Próximos Passos

1. Faça logout completo
2. Tente fazer login com Google
3. O sistema deve criar uma nova conta OAuth
4. Se houver match com a conta `@nipponlife`, ela será automaticamente unificada!

## Logs

Os logs de unificação aparecem no console do servidor:

```
[Account Linking] Merging OAuth account {new_id} with existing account {old_id}
[Account Linking] Successfully merged accounts
```
