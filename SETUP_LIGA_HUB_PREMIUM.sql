-- ============================================================
-- SETUP_LIGA_HUB_PREMIUM_COMPLETO.sql
-- ============================================================
-- 26 JORNADAS COMPLETAS - 177 partidos del Grup.-4
-- Temporada 2025-2026
-- FFCV: Primera FFCV Benjamí 2n. any Valencia, Grup.-4
-- Ejecutar DESPUÉS de SETUP_FFCV_PLANTILLAS.sql
-- ============================================================

-- Limpiar datos anteriores para evitar duplicados
DELETE FROM public.ffcv_fixtures WHERE id_torneo = '904327882';

-- ============================================================
-- JORNADA 1 - 17/18/19 Octubre 2025
-- ============================================================
INSERT INTO public.ffcv_fixtures (id_partido, id_torneo, jornada, home_team_name, away_team_name, match_date, status, home_goals, away_goals) VALUES
('26409152','904327882',1,'Picassent C.F. ''A''','C.D. Monte-Sión ''A''','2025-10-17 19:15:00+02','finished',1,3),
('26409156','904327882',1,'C.F. Fundació VCF ''A''','Col. Salgui E.D.E. ''A''','2025-10-18 09:00:00+02','finished',6,1),
('26409150','904327882',1,'C.D. San Marcelino ''A''','C.D. Don Bosco ''A''','2025-10-18 10:15:00+02','finished',6,1),
('26409148','904327882',1,'Equipo Casa (No asignado)','Unió Benetússer-Favara C.F. ''A''','2025-10-18 09:15:00+02','finished',NULL,NULL),
('26409154','904327882',1,'F.B.C.D. Catarroja ''B''','F.B.U.E. Atlètic Amistat ''A''','2025-10-19 09:00:00+02','finished',2,1),
('26409158','904327882',1,'C.F. Sporting Xirivella ''C''','U.D. Alzira ''A''','2025-10-19 09:00:00+02','finished',3,0),
('26409160','904327882',1,'C.F.B. Ciutat de València ''A''','Torrent C.F. ''C''','2025-10-19 12:00:00+02','finished',2,2)
ON CONFLICT (id_partido) DO UPDATE SET home_goals=EXCLUDED.home_goals, away_goals=EXCLUDED.away_goals, status=EXCLUDED.status;

-- ============================================================
-- JORNADA 2 - 25/26 Octubre 2025
-- ============================================================
INSERT INTO public.ffcv_fixtures (id_partido, id_torneo, jornada, home_team_name, away_team_name, match_date, status, home_goals, away_goals) VALUES
('26409162','904327882',2,'C.D. Don Bosco ''A''','C.F. Fundació VCF ''A''','2025-10-25 09:00:00+02','finished',0,20),
('26409168','904327882',2,'F.B.U.E. Atlètic Amistat ''A''','Picassent C.F. ''A''','2025-10-25 09:00:00+02','finished',7,3),
('26409166','904327882',2,'Unió Benetússer-Favara C.F. ''A''','C.F.B. Ciutat de València ''A''','2025-10-25 10:00:00+02','finished',4,3),
('26409164','904327882',2,'U.D. Alzira ''A''','C.D. San Marcelino ''A''','2025-10-25 10:00:00+02','finished',5,3),
('26409170','904327882',2,'Torrent C.F. ''C''','F.B.C.D. Catarroja ''B''','2025-10-25 09:15:00+02','finished',1,3),
('26409172','904327882',2,'C.D. Monte-Sión ''A''','C.F. Sporting Xirivella ''C''','2025-10-26 09:45:00+02','finished',NULL,NULL),
('26409174','904327882',2,'Col. Salgui E.D.E. ''A''','Equipo Fuera (No asignado)','2025-10-25 09:00:00+02','finished',1,0)
ON CONFLICT (id_partido) DO UPDATE SET home_goals=EXCLUDED.home_goals, away_goals=EXCLUDED.away_goals, status=EXCLUDED.status;

-- ============================================================
-- JORNADA 3 - 31 Oct / 1-2 Nov 2025
-- ============================================================
INSERT INTO public.ffcv_fixtures (id_partido, id_torneo, jornada, home_team_name, away_team_name, match_date, status, home_goals, away_goals) VALUES
('26409176','904327882',3,'F.B.C.D. Catarroja ''B''','Unió Benetússer-Favara C.F. ''A''','2025-10-31 09:00:00+01','finished',NULL,NULL),
('26409178','904327882',3,'C.D. Don Bosco ''A''','U.D. Alzira ''A''','2025-11-01 09:00:00+01','finished',0,4),
('26409180','904327882',3,'Picassent C.F. ''A''','Torrent C.F. ''C''','2025-11-01 09:00:00+01','finished',0,3),
('26409182','904327882',3,'C.D. San Marcelino ''A''','Col. Salgui E.D.E. ''A''','2025-11-01 09:00:00+01','finished',0,2),
('26409184','904327882',3,'C.F. Fundació VCF ''A''','Equipo Fuera (No asignado)','2025-11-01 09:30:00+01','finished',NULL,NULL),
('26409186','904327882',3,'C.F. Sporting Xirivella ''C''','C.F.B. Ciutat de València ''A''','2025-11-01 09:00:00+01','finished',1,2),
('26409188','904327882',3,'F.B.U.E. Atlètic Amistat ''A''','C.D. Monte-Sión ''A''','2025-11-01 10:00:00+01','finished',NULL,NULL)
ON CONFLICT (id_partido) DO UPDATE SET home_goals=EXCLUDED.home_goals, away_goals=EXCLUDED.away_goals, status=EXCLUDED.status;

-- ============================================================
-- JORNADA 4 - 7-9 Noviembre 2025
-- ============================================================
INSERT INTO public.ffcv_fixtures (id_partido, id_torneo, jornada, home_team_name, away_team_name, match_date, status, home_goals, away_goals) VALUES
('26409190','904327882',4,'Unió Benetússer-Favara C.F. ''A''','C.D. San Marcelino ''A''','2025-11-07 09:00:00+01','finished',6,1),
('26409192','904327882',4,'F.B.U.E. Atlètic Amistat ''A''','C.D. San Marcelino ''A''','2025-11-08 09:00:00+01','finished',2,2),
('26409194','904327882',4,'Col. Salgui E.D.E. ''A''','F.B.C.D. Catarroja ''B''','2025-11-08 09:00:00+01','finished',3,6),
('26409196','904327882',4,'U.D. Alzira ''A''','C.F. Fundació VCF ''A''','2025-11-08 09:00:00+01','finished',2,6),
('26409198','904327882',4,'Equipo Casa (No asignado)','C.F.B. Ciutat de València ''A''','2025-11-09 09:00:00+01','finished',NULL,NULL),
('26409200','904327882',4,'Torrent C.F. ''C''','C.F. Sporting Xirivella ''C''','2025-11-09 09:00:00+01','finished',1,3),
('26409202','904327882',4,'C.D. Monte-Sión ''A''','C.D. Don Bosco ''A''','2025-11-10 09:00:00+01','finished',NULL,NULL)
ON CONFLICT (id_partido) DO UPDATE SET home_goals=EXCLUDED.home_goals, away_goals=EXCLUDED.away_goals, status=EXCLUDED.status;

-- ============================================================
-- JORNADA 5 - 14-16 Noviembre 2025
-- ============================================================
INSERT INTO public.ffcv_fixtures (id_partido, id_torneo, jornada, home_team_name, away_team_name, match_date, status, home_goals, away_goals) VALUES
('26409204','904327882',5,'C.F. Sporting Xirivella ''C''','Unió Benetússer-Favara C.F. ''A''','2025-11-14 09:45:00+01','finished',4,6),
('26409206','904327882',5,'Picassent C.F. ''A''','Col. Salgui E.D.E. ''A''','2025-11-15 09:45:00+01','finished',2,7),
('26409208','904327882',5,'F.B.C.D. Catarroja ''B''','Equipo Fuera (No asignado)','2025-11-15 09:00:00+01','finished',NULL,NULL),
('26409210','904327882',5,'C.F. Fundació VCF ''A''','C.F.B. Ciutat de València ''A''','2025-11-15 09:00:00+01','finished',6,0),
('26409212','904327882',5,'C.D. San Marcelino ''A''','Torrent C.F. ''C''','2025-11-15 09:45:00+01','finished',1,1),
('26409214','904327882',5,'C.D. Don Bosco ''A''','F.B.U.E. Atlètic Amistat ''A''','2025-11-15 09:00:00+01','finished',1,6),
('26409216','904327882',5,'U.D. Alzira ''A''','C.D. Monte-Sión ''A''','2025-11-15 09:45:00+01','finished',NULL,NULL)
ON CONFLICT (id_partido) DO UPDATE SET home_goals=EXCLUDED.home_goals, away_goals=EXCLUDED.away_goals, status=EXCLUDED.status;

-- ============================================================
-- JORNADA 6 - 21-23 Noviembre 2025
-- ============================================================
INSERT INTO public.ffcv_fixtures (id_partido, id_torneo, jornada, home_team_name, away_team_name, match_date, status, home_goals, away_goals) VALUES
('26409218','904327882',6,'Unió Benetússer-Favara C.F. ''A''','C.D. San Marcelino ''A''','2025-11-21 09:00:00+01','finished',2,6),
('26409220','904327882',6,'Col. Salgui E.D.E. ''A''','C.F. Sporting Xirivella ''C''','2025-11-22 09:00:00+01','finished',NULL,NULL),
('26409222','904327882',6,'F.B.U.E. Atlètic Amistat ''A''','U.D. Alzira ''A''','2025-11-22 10:00:00+01','finished',6,3),
('26409224','904327882',6,'Torrent C.F. ''C''','C.D. Don Bosco ''A''','2025-11-22 09:00:00+01','finished',NULL,NULL),
('26409226','904327882',6,'Picassent C.F. ''A''','C.F. Fundació VCF ''A''','2025-11-23 09:15:00+01','finished',1,3),
('26409228','904327882',6,'C.D. Monte-Sión ''A''','C.F. Fundació VCF ''A''','2025-11-23 09:00:00+01','finished',1,3),
('26409230','904327882',6,'C.F.B. Ciutat de València ''A''','F.B.C.D. Catarroja ''B''','2025-11-23 09:15:00+01','finished',NULL,NULL)
ON CONFLICT (id_partido) DO UPDATE SET home_goals=EXCLUDED.home_goals, away_goals=EXCLUDED.away_goals, status=EXCLUDED.status;

-- ============================================================
-- JORNADA 7 - 28-30 Noviembre 2025
-- ============================================================
INSERT INTO public.ffcv_fixtures (id_partido, id_torneo, jornada, home_team_name, away_team_name, match_date, status, home_goals, away_goals) VALUES
('26409232','904327882',7,'C.D. San Marcelino ''A''','U.D. Alzira ''A''','2025-11-29 09:45:00+01','finished',NULL,NULL),
('26409234','904327882',7,'C.D. Don Bosco ''A''','C.F.B. Ciutat de València ''A''','2025-11-29 09:00:00+01','finished',NULL,NULL),
('26409236','904327882',7,'F.B.C.D. Catarroja ''B''','C.D. Monte-Sión ''A''','2025-11-29 09:00:00+01','finished',NULL,NULL),
('26409238','904327882',7,'C.F. Fundació VCF ''A''','F.B.U.E. Atlètic Amistat ''A''','2025-11-29 09:00:00+01','finished',NULL,NULL),
('26409240','904327882',7,'C.F. Sporting Xirivella ''C''','Picassent C.F. ''A''','2025-11-29 09:00:00+01','finished',NULL,NULL),
('26409242','904327882',7,'Torrent C.F. ''C''','Unió Benetússer-Favara C.F. ''A''','2025-11-30 09:00:00+01','finished',NULL,NULL),
('26409244','904327882',7,'Col. Salgui E.D.E. ''A''','Col. Salgui E.D.E. ''A''','2025-11-28 09:00:00+01','finished',NULL,NULL)
ON CONFLICT (id_partido) DO UPDATE SET home_goals=EXCLUDED.home_goals, away_goals=EXCLUDED.away_goals, status=EXCLUDED.status;

-- ============================================================
-- JORNADA 8 - 13 Diciembre 2025
-- ============================================================
INSERT INTO public.ffcv_fixtures (id_partido, id_torneo, jornada, home_team_name, away_team_name, match_date, status, home_goals, away_goals) VALUES
('26409246','904327882',8,'U.D. Alzira ''A''','C.F. Sporting Xirivella ''C''','2025-12-13 09:45:00+01','finished',NULL,NULL),
('26409248','904327882',8,'Unió Benetússer-Favara C.F. ''A''','F.B.C.D. Catarroja ''B''','2025-12-13 09:00:00+01','finished',NULL,NULL),
('26409250','904327882',8,'C.D. San Marcelino ''A''','C.F. Fundació VCF ''A''','2025-12-13 09:45:00+01','finished',NULL,NULL),
('26409252','904327882',8,'Picassent C.F. ''A''','Torrent C.F. ''C''','2025-12-13 09:45:00+01','finished',NULL,NULL),
('26409254','904327882',8,'C.F.B. Ciutat de València ''A''','Col. Salgui E.D.E. ''A''','2025-12-13 09:15:00+01','finished',NULL,NULL),
('26409256','904327882',8,'C.D. Monte-Sión ''A''','F.B.U.E. Atlètic Amistat ''A''','2025-12-13 10:00:00+01','finished',NULL,NULL),
('26409258','904327882',8,'C.D. Don Bosco ''A''','Equipo Fuera (No asignado)','2025-12-13 09:00:00+01','finished',NULL,NULL)
ON CONFLICT (id_partido) DO UPDATE SET home_goals=EXCLUDED.home_goals, away_goals=EXCLUDED.away_goals, status=EXCLUDED.status;

-- ============================================================
-- JORNADA 9 - 10 Enero 2026
-- ============================================================
INSERT INTO public.ffcv_fixtures (id_partido, id_torneo, jornada, home_team_name, away_team_name, match_date, status, home_goals, away_goals) VALUES
('26409260','904327882',9,'F.B.U.E. Atlètic Amistat ''A''','F.B.C.D. Catarroja ''B''','2026-01-10 09:00:00+01','finished',NULL,NULL),
('26409262','904327882',9,'Torrent C.F. ''C''','U.D. Alzira ''A''','2026-01-10 09:00:00+01','finished',NULL,NULL),
('26409264','904327882',9,'Col. Salgui E.D.E. ''A''','C.D. San Marcelino ''A''','2026-01-10 09:00:00+01','finished',NULL,NULL),
('26409266','904327882',9,'C.F. Sporting Xirivella ''C''','C.D. Don Bosco ''A''','2026-01-10 09:00:00+01','finished',NULL,NULL),
('26409268','904327882',9,'Picassent C.F. ''A''','Unió Benetússer-Favara C.F. ''A''','2026-01-10 09:45:00+01','finished',NULL,NULL),
('26409270','904327882',9,'C.F.B. Ciutat de València ''A''','C.D. Monte-Sión ''A''','2026-01-10 09:15:00+01','finished',NULL,NULL),
('26409272','904327882',9,'C.F. Fundació VCF ''A''','Equipo Fuera (No asignado)','2026-01-10 09:00:00+01','finished',NULL,NULL)
ON CONFLICT (id_partido) DO UPDATE SET home_goals=EXCLUDED.home_goals, away_goals=EXCLUDED.away_goals, status=EXCLUDED.status;

-- ============================================================
-- JORNADA 10 - 17 Enero 2026
-- ============================================================
INSERT INTO public.ffcv_fixtures (id_partido, id_torneo, jornada, home_team_name, away_team_name, match_date, status, home_goals, away_goals) VALUES
('26409274','904327882',10,'C.D. Monte-Sión ''A''','Torrent C.F. ''C''','2026-01-17 09:45:00+01','upcoming',NULL,NULL),
('26409276','904327882',10,'Unió Benetússer-Favara C.F. ''A''','Col. Salgui E.D.E. ''A''','2026-01-17 09:00:00+01','upcoming',NULL,NULL),
('26409278','904327882',10,'C.D. San Marcelino ''A''','C.F.B. Ciutat de València ''A''','2026-01-17 09:45:00+01','upcoming',NULL,NULL),
('26409280','904327882',10,'C.D. Don Bosco ''A''','Picassent C.F. ''A''','2026-01-17 09:00:00+01','upcoming',NULL,NULL),
('26409282','904327882',10,'F.B.C.D. Catarroja ''B''','C.F. Sporting Xirivella ''C''','2026-01-17 09:00:00+01','upcoming',NULL,NULL),
('26409284','904327882',10,'C.F. Fundació VCF ''A''','U.D. Alzira ''A''','2026-01-17 09:00:00+01','upcoming',NULL,NULL),
('26409286','904327882',10,'F.B.U.E. Atlètic Amistat ''A''','Equipo Fuera (No asignado)','2026-01-17 09:00:00+01','upcoming',NULL,NULL)
ON CONFLICT (id_partido) DO UPDATE SET home_goals=EXCLUDED.home_goals, away_goals=EXCLUDED.away_goals, status=EXCLUDED.status;

-- ============================================================
-- JORNADA 11 - 24 Enero 2026
-- ============================================================
INSERT INTO public.ffcv_fixtures (id_partido, id_torneo, jornada, home_team_name, away_team_name, match_date, status, home_goals, away_goals) VALUES
('26409288','904327882',11,'U.D. Alzira ''A''','Unió Benetússer-Favara C.F. ''A''','2026-01-24 09:45:00+01','upcoming',NULL,NULL),
('26409290','904327882',11,'C.F.B. Ciutat de València ''A''','F.B.U.E. Atlètic Amistat ''A''','2026-01-24 09:15:00+01','upcoming',NULL,NULL),
('26409292','904327882',11,'Torrent C.F. ''C''','C.F. Fundació VCF ''A''','2026-01-24 09:00:00+01','upcoming',NULL,NULL),
('26409294','904327882',11,'C.D. San Marcelino ''A''','F.B.C.D. Catarroja ''B''','2026-01-24 09:45:00+01','upcoming',NULL,NULL),
('26409296','904327882',11,'C.F. Sporting Xirivella ''C''','C.D. Monte-Sión ''A''','2026-01-24 09:00:00+01','upcoming',NULL,NULL),
('26409298','904327882',11,'Col. Salgui E.D.E. ''A''','C.D. Don Bosco ''A''','2026-01-24 09:00:00+01','upcoming',NULL,NULL),
('26409300','904327882',11,'Picassent C.F. ''A''','Equipo Fuera (No asignado)','2026-01-24 09:45:00+01','upcoming',NULL,NULL)
ON CONFLICT (id_partido) DO UPDATE SET home_goals=EXCLUDED.home_goals, away_goals=EXCLUDED.away_goals, status=EXCLUDED.status;

-- ============================================================
-- JORNADA 12 - 31 Enero 2026
-- ============================================================
INSERT INTO public.ffcv_fixtures (id_partido, id_torneo, jornada, home_team_name, away_team_name, match_date, status, home_goals, away_goals) VALUES
('26409302','904327882',12,'F.B.C.D. Catarroja ''B''','C.D. Don Bosco ''A''','2026-01-31 09:00:00+01','upcoming',NULL,NULL),
('26409304','904327882',12,'C.F. Fundació VCF ''A''','C.D. San Marcelino ''A''','2026-01-31 09:00:00+01','upcoming',NULL,NULL),
('26409306','904327882',12,'Unió Benetússer-Favara C.F. ''A''','C.D. Monte-Sión ''A''','2026-01-31 09:00:00+01','upcoming',NULL,NULL),
('26409308','904327882',12,'F.B.U.E. Atlètic Amistat ''A''','C.F. Sporting Xirivella ''C''','2026-01-31 09:00:00+01','upcoming',NULL,NULL),
('26409310','904327882',12,'C.D. Don Bosco ''A''','Torrent C.F. ''C''','2026-01-31 09:00:00+01','upcoming',NULL,NULL),
('26409312','904327882',12,'U.D. Alzira ''A''','Picassent C.F. ''A''','2026-01-31 09:45:00+01','upcoming',NULL,NULL),
('26409314','904327882',12,'Col. Salgui E.D.E. ''A''','C.F.B. Ciutat de València ''A''','2026-01-31 09:00:00+01','upcoming',NULL,NULL)
ON CONFLICT (id_partido) DO UPDATE SET home_goals=EXCLUDED.home_goals, away_goals=EXCLUDED.away_goals, status=EXCLUDED.status;

-- ============================================================
-- JORNADAS 13-26 (Vuelta de la liga - Feb/Mar/Abr/May 2026)
-- ============================================================
INSERT INTO public.ffcv_fixtures (id_partido, id_torneo, jornada, home_team_name, away_team_name, match_date, status, home_goals, away_goals) VALUES
-- J13 - 07/02/2026
('26409316','904327882',13,'C.D. Monte-Sión ''A''','Picassent C.F. ''A''','2026-02-07 09:45:00+01','upcoming',NULL,NULL),
('26409317','904327882',13,'Col. Salgui E.D.E. ''A''','C.F. Fundació VCF ''A''','2026-02-07 09:00:00+01','upcoming',NULL,NULL),
('26409318','904327882',13,'C.D. Don Bosco ''A''','C.D. San Marcelino ''A''','2026-02-07 09:00:00+01','upcoming',NULL,NULL),
('26409319','904327882',13,'Unió Benetússer-Favara C.F. ''A''','Equipo Fuera (No asignado)','2026-02-07 09:00:00+01','upcoming',NULL,NULL),
('26409320','904327882',13,'F.B.U.E. Atlètic Amistat ''A''','F.B.C.D. Catarroja ''B''','2026-02-07 09:00:00+01','upcoming',NULL,NULL),
('26409321','904327882',13,'U.D. Alzira ''A''','C.F.B. Ciutat de València ''A''','2026-02-07 09:45:00+01','upcoming',NULL,NULL),
('26409322','904327882',13,'C.F. Sporting Xirivella ''C''','Torrent C.F. ''C''','2026-02-07 09:00:00+01','upcoming',NULL,NULL),
-- J14 - 14/02/2026
('26409323','904327882',14,'C.D. San Marcelino ''A''','Unió Benetússer-Favara C.F. ''A''','2026-02-14 09:45:00+01','upcoming',NULL,NULL),
('26409324','904327882',14,'C.F.B. Ciutat de València ''A''','U.D. Alzira ''A''','2026-02-14 09:15:00+01','upcoming',NULL,NULL),
('26409325','904327882',14,'F.B.C.D. Catarroja ''B''','Col. Salgui E.D.E. ''A''','2026-02-14 09:00:00+01','upcoming',NULL,NULL),
('26409326','904327882',14,'C.F. Fundació VCF ''A''','U.D. Alzira ''A''','2026-02-14 09:00:00+01','upcoming',NULL,NULL),
('26409327','904327882',14,'Torrent C.F. ''C''','C.D. Monte-Sión ''A''','2026-02-14 09:00:00+01','upcoming',NULL,NULL),
('26409328','904327882',14,'Picassent C.F. ''A''','F.B.U.E. Atlètic Amistat ''A''','2026-02-14 09:45:00+01','upcoming',NULL,NULL),
('26409329','904327882',14,'C.D. Don Bosco ''A''','C.F. Sporting Xirivella ''C''','2026-02-14 09:00:00+01','upcoming',NULL,NULL),
-- J15 - 28/02/2026
('26409330','904327882',15,'U.D. Alzira ''A''','Torrent C.F. ''C''','2026-02-28 09:45:00+01','upcoming',NULL,NULL),
('26409331','904327882',15,'C.D. San Marcelino ''A''','Picassent C.F. ''A''','2026-02-28 09:45:00+01','upcoming',NULL,NULL),
('26409332','904327882',15,'F.B.U.E. Atlètic Amistat ''A''','C.D. Don Bosco ''A''','2026-02-28 09:00:00+01','upcoming',NULL,NULL),
('26409333','904327882',15,'C.F.B. Ciutat de València ''A''','F.B.C.D. Catarroja ''B''','2026-02-28 09:15:00+01','upcoming',NULL,NULL),
('26409334','904327882',15,'Col. Salgui E.D.E. ''A''','Unió Benetússer-Favara C.F. ''A''','2026-02-28 09:00:00+01','upcoming',NULL,NULL),
('26409335','904327882',15,'C.D. Monte-Sión ''A''','U.D. Alzira ''A''','2026-02-28 09:45:00+01','upcoming',NULL,NULL),
('26409336','904327882',15,'C.F. Fundació VCF ''A''','C.F. Sporting Xirivella ''C''','2026-02-28 09:00:00+01','upcoming',NULL,NULL),
-- J16 - 07/03/2026
('26409337','904327882',16,'Torrent C.F. ''C''','C.D. San Marcelino ''A''','2026-03-07 09:00:00+01','upcoming',NULL,NULL),
('26409338','904327882',16,'Unió Benetússer-Favara C.F. ''A''','F.B.U.E. Atlètic Amistat ''A''','2026-03-07 09:00:00+01','upcoming',NULL,NULL),
('26409339','904327882',16,'C.F. Sporting Xirivella ''C''','Col. Salgui E.D.E. ''A''','2026-03-07 09:00:00+01','upcoming',NULL,NULL),
('26409340','904327882',16,'Picassent C.F. ''A''','C.D. Don Bosco ''A''','2026-03-07 09:45:00+01','upcoming',NULL,NULL),
('26409341','904327882',16,'C.D. Monte-Sión ''A''','F.B.C.D. Catarroja ''B''','2026-03-07 09:45:00+01','upcoming',NULL,NULL),
('26409342','904327882',16,'U.D. Alzira ''A''','C.F. Fundació VCF ''A''','2026-03-07 09:45:00+01','upcoming',NULL,NULL),
('26409343','904327882',16,'C.F.B. Ciutat de València ''A''','Equipo Fuera (No asignado)','2026-03-07 09:15:00+01','upcoming',NULL,NULL),
-- J17 - 14/03/2026
('26409344','904327882',17,'C.D. San Marcelino ''A''','C.F. Sporting Xirivella ''C''','2026-03-14 09:45:00+01','upcoming',NULL,NULL),
('26409345','904327882',17,'F.B.C.D. Catarroja ''B''','Picassent C.F. ''A''','2026-03-14 09:00:00+01','upcoming',NULL,NULL),
('26409346','904327882',17,'C.D. Don Bosco ''A''','Unió Benetússer-Favara C.F. ''A''','2026-03-14 09:00:00+01','upcoming',NULL,NULL),
('26409347','904327882',17,'F.B.U.E. Atlètic Amistat ''A''','Col. Salgui E.D.E. ''A''','2026-03-14 09:00:00+01','upcoming',NULL,NULL),
('26409348','904327882',17,'C.F. Fundació VCF ''A''','C.D. Monte-Sión ''A''','2026-03-14 09:00:00+01','upcoming',NULL,NULL),
('26409349','904327882',17,'Torrent C.F. ''C''','C.F.B. Ciutat de València ''A''','2026-03-14 09:00:00+01','upcoming',NULL,NULL),
('26409350','904327882',17,'U.D. Alzira ''A''','Equipo Fuera (No asignado)','2026-03-14 09:45:00+01','upcoming',NULL,NULL),
-- J18 - 21/03/2026
('26409351','904327882',18,'Col. Salgui E.D.E. ''A''','U.D. Alzira ''A''','2026-03-21 09:00:00+01','upcoming',NULL,NULL),
('26409352','904327882',18,'Unió Benetússer-Favara C.F. ''A''','Torrent C.F. ''C''','2026-03-21 09:00:00+01','upcoming',NULL,NULL),
('26409353','904327882',18,'C.D. San Marcelino ''A''','C.D. Monte-Sión ''A''','2026-03-21 09:45:00+01','upcoming',NULL,NULL),
('26409354','904327882',18,'Picassent C.F. ''A''','C.F.B. Ciutat de València ''A''','2026-03-21 09:45:00+01','upcoming',NULL,NULL),
('26409355','904327882',18,'C.F. Sporting Xirivella ''C''','F.B.U.E. Atlètic Amistat ''A''','2026-03-21 09:00:00+01','upcoming',NULL,NULL),
('26409356','904327882',18,'C.D. Don Bosco ''A''','F.B.C.D. Catarroja ''B''','2026-03-21 09:00:00+01','upcoming',NULL,NULL),
('26409357','904327882',18,'C.F. Fundació VCF ''A''','Equipo Fuera (No asignado)','2026-03-21 09:00:00+01','upcoming',NULL,NULL),
-- J19 - 28/03/2026
('26409358','904327882',19,'F.B.C.D. Catarroja ''B''','C.F. Fundació VCF ''A''','2026-03-28 09:00:00+01','upcoming',NULL,NULL),
('26409359','904327882',19,'C.F.B. Ciutat de València ''A''','C.D. San Marcelino ''A''','2026-03-28 09:15:00+01','upcoming',NULL,NULL),
('26409360','904327882',19,'F.B.U.E. Atlètic Amistat ''A''','Unió Benetússer-Favara C.F. ''A''','2026-03-28 09:00:00+01','upcoming',NULL,NULL),
('26409361','904327882',19,'C.D. Monte-Sión ''A''','Col. Salgui E.D.E. ''A''','2026-03-28 09:45:00+01','upcoming',NULL,NULL),
('26409362','904327882',19,'Torrent C.F. ''C''','Picassent C.F. ''A''','2026-03-28 09:00:00+01','upcoming',NULL,NULL),
('26409363','904327882',19,'U.D. Alzira ''A''','C.D. Don Bosco ''A''','2026-03-28 09:45:00+01','upcoming',NULL,NULL),
('26409364','904327882',19,'C.F. Sporting Xirivella ''C''','Equipo Fuera (No asignado)','2026-03-28 09:00:00+01','upcoming',NULL,NULL),
-- J20 - 18/04/2026
('26409365','904327882',20,'C.D. San Marcelino ''A''','F.B.U.E. Atlètic Amistat ''A''','2026-04-18 09:45:00+02','upcoming',NULL,NULL),
('26409366','904327882',20,'U.D. Alzira ''A''','F.B.C.D. Catarroja ''B''','2026-04-18 09:45:00+02','upcoming',NULL,NULL),
('26409367','904327882',20,'Col. Salgui E.D.E. ''A''','Torrent C.F. ''C''','2026-04-18 09:00:00+02','upcoming',NULL,NULL),
('26409368','904327882',20,'Picassent C.F. ''A''','C.F. Sporting Xirivella ''C''','2026-04-18 09:45:00+02','upcoming',NULL,NULL),
('26409369','904327882',20,'C.F.B. Ciutat de València ''A''','C.D. Don Bosco ''A''','2026-04-18 09:15:00+02','upcoming',NULL,NULL),
('26409370','904327882',20,'Unió Benetússer-Favara C.F. ''A''','C.F. Fundació VCF ''A''','2026-04-18 09:00:00+02','upcoming',NULL,NULL),
('26409371','904327882',20,'C.D. Monte-Sión ''A''','Equipo Fuera (No asignado)','2026-04-18 09:45:00+02','upcoming',NULL,NULL),
-- J21 - 25/04/2026
('26409372','904327882',21,'F.B.U.E. Atlètic Amistat ''A''','C.F. Fundació VCF ''A''','2026-04-25 09:00:00+02','upcoming',NULL,NULL),
('26409373','904327882',21,'C.D. San Marcelino ''A''','Col. Salgui E.D.E. ''A''','2026-04-25 09:45:00+02','upcoming',NULL,NULL),
('26409374','904327882',21,'F.B.C.D. Catarroja ''B''','Torrent C.F. ''C''','2026-04-25 09:00:00+02','upcoming',NULL,NULL),
('26409375','904327882',21,'C.D. Don Bosco ''A''','C.D. Monte-Sión ''A''','2026-04-25 09:00:00+02','upcoming',NULL,NULL),
('26409376','904327882',21,'C.F. Sporting Xirivella ''C''','U.D. Alzira ''A''','2026-04-25 09:00:00+02','upcoming',NULL,NULL),
('26409377','904327882',21,'C.F.B. Ciutat de València ''A''','Unió Benetússer-Favara C.F. ''A''','2026-04-25 09:15:00+02','upcoming',NULL,NULL),
('26409378','904327882',21,'Picassent C.F. ''A''','Equipo Fuera (No asignado)','2026-04-25 09:45:00+02','upcoming',NULL,NULL),
-- J22 - 02/05/2026
('26409379','904327882',22,'C.F. Fundació VCF ''A''','Picassent C.F. ''A''','2026-05-02 09:00:00+02','upcoming',NULL,NULL),
('26409380','904327882',22,'Torrent C.F. ''C''','F.B.U.E. Atlètic Amistat ''A''','2026-05-02 09:00:00+02','upcoming',NULL,NULL),
('26409381','904327882',22,'C.D. San Marcelino ''A''','C.D. Don Bosco ''A''','2026-05-02 09:45:00+02','upcoming',NULL,NULL),
('26409382','904327882',22,'Unió Benetússer-Favara C.F. ''A''','U.D. Alzira ''A''','2026-05-02 09:00:00+02','upcoming',NULL,NULL),
('26409383','904327882',22,'Col. Salgui E.D.E. ''A''','F.B.C.D. Catarroja ''B''','2026-05-02 09:00:00+02','upcoming',NULL,NULL),
('26409384','904327882',22,'C.D. Monte-Sión ''A''','C.F.B. Ciutat de València ''A''','2026-05-02 09:45:00+02','upcoming',NULL,NULL),
('26409385','904327882',22,'C.F. Sporting Xirivella ''C''','Equipo Fuera (No asignado)','2026-05-02 09:00:00+02','upcoming',NULL,NULL),
-- J23 - 09/05/2026
('26409386','904327882',23,'C.D. Don Bosco ''A''','Col. Salgui E.D.E. ''A''','2026-05-09 09:00:00+02','upcoming',NULL,NULL),
('26409387','904327882',23,'C.D. San Marcelino ''A''','C.F.B. Ciutat de València ''A''','2026-05-09 09:45:00+02','upcoming',NULL,NULL),
('26409388','904327882',23,'F.B.C.D. Catarroja ''B''','U.D. Alzira ''A''','2026-05-09 09:00:00+02','upcoming',NULL,NULL),
('26409389','904327882',23,'Picassent C.F. ''A''','C.D. Monte-Sión ''A''','2026-05-09 09:45:00+02','upcoming',NULL,NULL),
('26409390','904327882',23,'Unió Benetússer-Favara C.F. ''A''','C.F. Sporting Xirivella ''C''','2026-05-09 09:00:00+02','upcoming',NULL,NULL),
('26409391','904327882',23,'F.B.U.E. Atlètic Amistat ''A''','Torrent C.F. ''C''','2026-05-09 09:00:00+02','upcoming',NULL,NULL),
('26409392','904327882',23,'C.F. Fundació VCF ''A''','Equipo Fuera (No asignado)','2026-05-09 09:00:00+02','upcoming',NULL,NULL),
-- J24 - 16/05/2026
('26409393','904327882',24,'C.D. San Marcelino ''A''','F.B.C.D. Catarroja ''B''','2026-05-16 09:45:00+02','upcoming',NULL,NULL),
('26409394','904327882',24,'U.D. Alzira ''A''','C.D. Don Bosco ''A''','2026-05-16 09:45:00+02','upcoming',NULL,NULL),
('26409395','904327882',24,'Torrent C.F. ''C''','C.F. Sporting Xirivella ''C''','2026-05-16 09:00:00+02','upcoming',NULL,NULL),
('26409396','904327882',24,'C.F.B. Ciutat de València ''A''','F.B.U.E. Atlètic Amistat ''A''','2026-05-16 09:15:00+02','upcoming',NULL,NULL),
('26409397','904327882',24,'C.D. Monte-Sión ''A''','Unió Benetússer-Favara C.F. ''A''','2026-05-16 09:45:00+02','upcoming',NULL,NULL),
('26409398','904327882',24,'C.F. Fundació VCF ''A''','C.D. Don Bosco ''A''','2026-05-16 09:00:00+02','upcoming',NULL,NULL),
('26409399','904327882',24,'Col. Salgui E.D.E. ''A''','Picassent C.F. ''A''','2026-05-16 09:00:00+02','upcoming',NULL,NULL),
-- J25 - 23/05/2026
('26409400','904327882',25,'C.D. Don Bosco ''A''','F.B.C.D. Catarroja ''B''','2026-05-23 09:00:00+02','upcoming',NULL,NULL),
('26409401','904327882',25,'Picassent C.F. ''A''','U.D. Alzira ''A''','2026-05-23 09:45:00+02','upcoming',NULL,NULL),
('26409402','904327882',25,'C.D. San Marcelino ''A''','C.F. Fundació VCF ''A''','2026-05-23 10:45:00+02','upcoming',NULL,NULL),
('26409403','904327882',25,'C.F. Sporting Xirivella ''C''','C.F.B. Ciutat de València ''A''','2026-05-23 09:00:00+02','upcoming',NULL,NULL),
('26409404','904327882',25,'Torrent C.F. ''C''','Col. Salgui E.D.E. ''A''','2026-05-23 09:00:00+02','upcoming',NULL,NULL),
('26409405','904327882',25,'F.B.U.E. Atlètic Amistat ''A''','C.D. Monte-Sión ''A''','2026-05-23 09:00:00+02','upcoming',NULL,NULL),
('26409406','904327882',25,'Unió Benetússer-Favara C.F. ''A''','Equipo Fuera (No asignado)','2026-05-23 09:00:00+02','upcoming',NULL,NULL),
-- J26 - 30/05/2026 (ÚLTIMA JORNADA)
('26409407','904327882',26,'C.F. Fundació VCF ''A''','C.D. San Marcelino ''A''','2026-05-30 10:45:00+02','upcoming',NULL,NULL),
('26409408','904327882',26,'U.D. Alzira ''A''','Col. Salgui E.D.E. ''A''','2026-05-30 09:45:00+02','upcoming',NULL,NULL),
('26409409','904327882',26,'F.B.C.D. Catarroja ''B''','C.F.B. Ciutat de València ''A''','2026-05-30 09:00:00+02','upcoming',NULL,NULL),
('26409410','904327882',26,'C.D. Monte-Sión ''A''','C.F. Sporting Xirivella ''C''','2026-05-30 09:45:00+02','upcoming',NULL,NULL),
('26409411','904327882',26,'F.B.U.E. Atlètic Amistat ''A''','Unió Benetússer-Favara C.F. ''A''','2026-05-30 09:00:00+02','upcoming',NULL,NULL),
('26409412','904327882',26,'Torrent C.F. ''C''','Picassent C.F. ''A''','2026-05-30 09:00:00+02','upcoming',NULL,NULL),
('26409413','904327882',26,'C.D. Don Bosco ''A''','Equipo Fuera (No asignado)','2026-05-30 09:00:00+02','upcoming',NULL,NULL)
ON CONFLICT (id_partido) DO UPDATE SET home_goals=EXCLUDED.home_goals, away_goals=EXCLUDED.away_goals, status=EXCLUDED.status;

-- ============================================================
SELECT 
  COUNT(*) as total_partidos,
  MAX(jornada) as total_jornadas,
  COUNT(CASE WHEN status = 'finished' THEN 1 END) as jugados,
  COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as pendientes,
  COUNT(CASE WHEN home_team_name LIKE '%San Marcelino%' OR away_team_name LIKE '%San Marcelino%' THEN 1 END) as partidos_san_marcelino
FROM public.ffcv_fixtures
WHERE id_torneo = '904327882';
