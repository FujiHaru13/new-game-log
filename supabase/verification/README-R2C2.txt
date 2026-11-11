R2-C2 verification HOLD: static checks and SQL design only.
Do NOT run against cloud. Create a disposable local Supabase/PostgreSQL database,
apply 0001-0009, then execute scenarios in docs/phase2b-r2-c2-isolated-validation.md.
No real PostgreSQL execution, auth/RLS test, concurrency test, or rollback test
has been performed in this environment. Do not enable v3 or apply migration.
