# from database import Base
# from sqlalchemy import Column, Integer, String, Float, Text, Boolean

# class User(Base):
#     __tablename__ = "user"

#     id = Column(Integer, primary_key = True, index = True)
#     username = Column(String, unique=True, index=True)
#     role = Column(String)

# class Profile(Base):
#     __tablename__ = "profile"

#     id = Column(Integer, primary_key = True, index = True)
#     title = Column(String)
#     author = Column(String)
#     published_year = Column(Integer)
#     price = Column(Float, nullable=True)
#     genre = Column(String, nullable=True)
#     customer_review = Column(Text, nullable=Text)

# class Profile_Others(Base):
#     __tablename__ = "profile_others"

#     id = Column(Integer, primary_key = True, index = True)
#     profile_id = Column(Integer)
#     type = Column(String)
#     value = Column(String)

# class Post_Job(Base):
#     __tablename__ = "post_job"

#     id = Column(Integer, primary_key = True, index = True)
#     job_title = Column(String)
#     job_type = Column(String)
#     work_mode = Column(String)
#     experience_level = Column(String)
#     location = Column(String)
#     salary_range = Column(Integer)
#     job_summary = Column(Text, nullable=False)
#     job_requirements = Column(Text)
#     soft_skills = Column(Text)
#     flexible_work_hour = Column(Boolean, default=False)
#     sensory_friendly_environment = Column(Boolean, default=False)
#     peer_support_system = Column(Boolean, default=False)
#     dedicated_workspace = Column(Boolean, default=False)
#     neurodiversity_awareness_training = Column(Boolean, default=False)
#     regular_supervisor_check_in = Column(Boolean, default=False)
#     zero_tolerance_bullying_mobbing_policy = Column(Boolean, default=False)
#     augmentative_alternative_communication = Column(Boolean, default=False)
#     quiet_room = Column(Boolean, default=False)
#     sensory_aids = Column(Boolean, default=False)
#     provide_visual_guidance = Column(Boolean, default=False)
#     uses_project_management_tools = Column(Boolean, default=False)
#     optional_social_event = Column(Boolean, default=False)
#     mental_health_support = Column(Boolean, default=False)
#     near_public_transport = Column(Boolean, default=False)
    
    



