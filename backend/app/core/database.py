from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# =====================================
# CONFIGURACIÓN DB (ajusta credenciales)
# =====================================
DATABASE_URL = "mysql+mysqlconnector://root:@localhost:3306/order_system"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# =====================================
# DEPENDENCIA PARA FASTAPI
# =====================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
