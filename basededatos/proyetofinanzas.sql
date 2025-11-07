create database proyectofinanzas
create database dbfinanzas

create table roles(
    RolId INT primary key,
    NombreRol VARCHAR(50) not null
);

create table usuarios(
    UsuarioId INT primary key AUTO_INCREMENT,   
    NombreCompleto VARCHAR(100) not null,
    Correo VARCHAR(100) not null unique, 
    Contraseña VARCHAR(255) not null,
    FechaRegistro DATE not null,
    NumeroTelefonico VARCHAR(20) null,
    estaActivo BOOLEAN not null DEFAULT true,
    fkroles INT not null DEFAULT 2,
    FOREIGN KEY (fkroles) REFERENCES roles(RolId)
);

create table tipoMovimiento(
    Id INT primary key,
    Nombre VARCHAR(50) not null
);
create table movimientos(
    Id INT primary key AUTO_INCREMENT,
    Gasto INT not null,
    Fecha DATE not null,
    Nombre VARCHAR(50) not null, 
    fkusuarios INT not null,
    tipogasto INT NOT null,
    FOREIGN KEY (tipogasto) REFERENCES TipoMovimiento(Id),
    FOREIGN KEY (fkusuarios) REFERENCES Usuarios(UsuarioId)
);
create table metasFinancieras(
     Id INT primary key AUTO_INCREMENT,
     Nombre VARCHAR(200) not null,
     costoobjeto INT not null,
     MontoAgregar INT not null,
     fkusuarios INT not null,
     FOREIGN KEY (fkusuarios) REFERENCES Usuarios(UsuarioId)
);

-- tipos de movimiento
insert into tipoMovimiento(Id, Nombre) values (1, 'Ingreso');
insert into tipoMovimiento(Id, Nombre) values (2, 'Gasto');

-- roles Predeterminads
insert into roles(RolId, NombreRol) values (1, 'Admin');
insert into roles(RolId, NombreRol) values (2, 'Usuario');


-- usuario predeterminado admin
insert into usuarios(NombreCompleto, Correo, Contraseña, FechaRegistro, NumeroTelefonico, fkroles) values ('Administrador', 'admin@admin.com', 'admin123', NOW(), '1234567890', 1);
--actualizar usuario
update usuarios set estaActivo = false where UsuarioId = 4;

--0: false: inactivo
--1: true: activo

-- ejemplo eliminar usuario
-- delete from usuarios where UsuarioId = 5;

SELECT * from usuarios where estaActivo = true AND UsuarioId = 4;

-- Usuarios de ejemplo


-- usuario 1 Daniel
insert into movimientos(Gasto, Fecha, Nombre, fkusuarios, tipogasto) values (3000000, '2024-06-01', 'salario', 1, 1);
insert into movimientos(Gasto, Fecha, Nombre, fkusuarios, tipogasto) values (600000, '2024-06-02', 'comida', 1, 2);
insert into movimientos(Gasto, Fecha, Nombre, fkusuarios, tipogasto) values (150000, '2024-06-03', 'Transporte', 1, 2);
insert into movimientos(Gasto, Fecha, Nombre, fkusuarios, tipogasto) values (250000, '2024-06-04', 'servicios publicos', 1, 2);

-- usuario 3 juls
insert into movimientos(Gasto, Fecha, Nombre, fkusuarios, tipogasto) values (5000000, '2024-06-01', 'salario', 3, 1);
insert into movimientos(Gasto, Fecha, Nombre, fkusuarios, tipogasto) values (600000, '2024-06-02', 'comida', 3, 2);
insert into movimientos(Gasto, Fecha, Nombre, fkusuarios, tipogasto) values (150000, '2024-06-03', 'Transporte', 3, 2);
insert into movimientos(Gasto, Fecha, Nombre, fkusuarios, tipogasto) values (250000, '2024-06-04', 'servicios publicos', 3, 2);

SELECT tm.Id as idGasto, tm.Nombre as tipoMovimiento, m.Id as idMovimiento, m.Nombre as nombreMovimiento, m.Gasto as valorMovimiento, m.Fecha as fechaMovimiento FROM movimientos m inner join tipoMovimiento tm on m.tipogasto = tm.Id inner join usuarios u on m.fkusuarios = u.UsuarioId where u.UsuarioId = 1;