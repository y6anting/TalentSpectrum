import os
import requests
import json
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

# ==========================
# Load environment variables
# ==========================
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    # Use standard error logging for scripts
    print("❌ GOOGLE_API_KEY not found in .env")
    exit(1)
    
# --- 1. Configuration and Data Fetching ---
# NOTE: Ensure your local server is running at this address!
CANDIDATE_URL = "http://127.0.0.1:8000/profiles/all/candidate-profiles"
JOB_URL = "http://127.0.0.1:8000/company/all/full_profile"
API_URL = "http://127.0.0.1:8000/match_results/store_results" # NEW: Endpoint to store results
MODEL_NAME = "gemini-2.0-flash"

def fetch_data(url: str) -> List[Dict[str, Any]]:
    """Fetches data from the local API endpoint."""
    print(f"Fetching data from: {url}")
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()  # Raise an HTTPError for bad responses
        # Attempt to parse JSON response
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching data from {url}: {e}")
        print("Please verify the local server is running and the URL is correct.")
        return []

# --- 2. Pydantic Schema for Structured Output ---
class MatchAnalysis(BaseModel):
    """Schema for the qualitative analysis of a single match layer."""
    matched: str = Field(
        ..., 
        description="A brief summary of the successful alignments (e.g., 'Python, Data Analysis, SQL')."
    )
    consider: str = Field(
        ..., 
        description="A brief summary of the gaps or points of friction (e.g., 'Limited experience with Machine Learning' or 'Salary expectation slightly high')."
    )
    ai_recommendation: str = Field(
        ..., 
        description="A concise final recommendation based on this layer (e.g., 'Candidate has strong basics with growth potential.')."
    )

class MatchScores(BaseModel):
    """Schema for the three-layered match scores (0-100) and analysis."""
    
    # Primary Match Fields
    primary_match_score: int = Field(
        ..., 
        description="Score (0-100) based on **Primary Match (Hard Requirements)**."
    )
    primary_analysis: MatchAnalysis
    
    # Secondary Match Fields
    secondary_match_score: int = Field(
        ..., 
        description="Score (0-100) based on **Secondary Match (Environmental Fit)**."
    )
    secondary_analysis: MatchAnalysis

    # Tertiary Match Fields
    tertiary_match_score: int = Field(
        ..., 
        description="Score (0-100) based on **Tertiary Match (Soft Factors)**."
    )
    tertiary_analysis: MatchAnalysis

    total_match_score: float = Field( # Changed to float for accurate weighted average calculation
        ..., 
        description="The final calculated total match score (0-100). Weighted average: P: 50%, S: 30%, T: 20%."
    )


# --- 3. LangChain/Gemini Setup and Prompt Definition ---
def setup_llm_chain():
    """Sets up the LangChain components: LLM and Structured Chain."""
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set. Please set it to your actual key.")

    # Initialize the LLM with structured output enforced
    llm = ChatGoogleGenerativeAI(model=MODEL_NAME, temperature=0.1, api_key=api_key)

    # 2. Define the Prompt Template
    system_prompt = (
        "You are an expert, multi-layered AI Job Matching algorithm. Your sole task is to analyze "
        "the provided Candidate Profile and Job Profile. Your output MUST be a single JSON object "
        "conforming exactly to the provided MatchScores schema, which includes the numerical scores (0-100) "
        "AND the detailed qualitative analysis (Matched, Consider, AI Recommendation) for each of the three layers: "
        "Primary, Secondary, and Tertiary. Do not add any conversational text or explanation outside the JSON structure."
    )

    human_prompt = (
        "**Candidate Profile:**\n```json\n{candidate_profile}\n```\n\n"
        "**Job Profile:**\n```json\n{job_profile}\n```\n\n"
        "**Matching Algorithm Criteria:**\n"
        "1. **Primary Match (Hard Requirements):** Compare technical skills, required experience level (`experience_level`), and job title alignment.\n"
        "2. **Secondary Match (Environmental Fit):** Compare candidate's environment preferences (e.g., `environment.auditory`, `environment.workdayStructure`) and communication medium (`environment.communicationMedium`) against the job's explicit support booleans in the job profile (e.g., `peer_support_system`, `flexible_work_hour`).\n"
        "3. **Tertiary Match (Soft Factors):** Compare salary expectation, work style (`environment.teamStyle`), and general alignment of soft skills and neurodivergent strengths.\n\n"
        "Analyze the profiles against the criteria and output the four scores, ensuring the **Total Match Score uses the 50/30/20 weighting**, and provide the detailed analysis for each of the three layers."
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", human_prompt),
    ])

    return prompt | llm.with_structured_output(MatchScores)


# --- Helper Function for Candidate Display ---
def get_candidate_summary(candidate: Dict[str, Any]) -> Dict[str, str]:
    """Extracts required display fields from a candidate profile based on the sample data structure."""
    
    personal = candidate.get("personal_identifiers", {})
    environment = candidate.get("environment", {})
    skills = candidate.get("skills", {})
    
    # Consolidate accommodations from environment fields
    accommodations_list = []
    if environment.get("auditory"):
        accommodations_list.append(f"Auditory: {environment['auditory']}")
    if environment.get("visual"):
        accommodations_list.append(f"Visual: {environment['visual']}")
    if environment.get("workspace"):
        accommodations_list.append(f"Workspace: {environment['workspace']}")
        
    def safe_get(data, keys, default="N/A"):
        current = data
        for key in keys:
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return default
        if not current:
            return default
        return current

    summary = {
        "name": candidate.get("name") or personal.get("fullName", "N/A"),
        # Use primary email for Pydantic validation later
        "email": personal.get("emailAddress", "placeholder@example.com"), 
        "location": personal.get("residentialAddress", "N/A"),
        "work_type_preference": environment.get("workdayStructure", "N/A"),
        # Combine HardSkills and SoftSkills
        "skills": ", ".join(skills.get("HardSkills", []) + skills.get("SoftSkills", [])),
        "accommodations": ", ".join(accommodations_list) or str(candidate.get("accommodations")) or "None specified",
        "communication_preference": environment.get("communicationMedium", "N/A"),
    }
    
    # Final cleanup of "N/A" and "None" strings
    for key, value in summary.items():
        if value is None or value in ["None specified", "None", "N/A", ""]:
            summary[key] = "N/A"
            
    return summary


# --- Helper Function for Job Display (Corrected for ID fetch) ---
def get_job_summary(job: Dict[str, Any]) -> Dict[str, str]:
    """Extracts required display fields from a job profile, using company data."""
    
    company_name = job.get("company_name", "Unknown Company") 
    
    summary = {
        # FIXED: Explicitly look for 'job_id' and fallback to 'id'
        "job_id": str(job.get("job_id") or job.get("id", "N/A")), 
        "job_title": job.get("job_title", "N/A"),
        
        "company_name": company_name, 
        # FIXED: Explicitly look for 'company_id'
        "company_id": str(job.get("company_id", "N/A")), 
        
        "employer_email": job.get("employer_email", "placeholder@example.com"), # Use placeholder for Pydantic
        "location": job.get("location", "N/A"),
        "experience_level": job.get("experience_level", "N/A"),
        "work_mode": job.get("work_mode", "N/A"),
    }
    
    # Final cleanup of "N/A" strings
    for key, value in summary.items():
        if value is None or value in ["None specified", "None", "N/A", ""]:
            summary[key] = "N/A"
            
    return summary

# --- New Function to Post Results to DB ---
def post_results_to_db(payload: Dict[str, Any]):
    """Sends the formatted match results payload to the FastAPI backend."""
    
    # The FastAPI model expects the CandidateMatchResultCreate structure, 
    # which is exactly what our payload should match here (one candidate + list of matches).

    print(f"\n--- Posting match results for {payload.get('candidate_name')} to DB... ---")

    try:
        response = requests.post(
            API_URL, 
            json=payload, 
            timeout=30 # Increased timeout for potential long commits
        )
        response.raise_for_status()
        
        # Print success message from the API
        api_response = response.json()
        print(f"✅ Success: {api_response.get('message', 'Data saved successfully.')}")
        
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP Error during POST: {e}")
        try:
            # Attempt to print the detailed error from the FastAPI response
            print(f"API Detail: {response.json().get('detail', 'No detailed error message from API.')}")
        except:
            print("Could not parse API error response.")
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection Error: Failed to connect to FastAPI endpoint at {API_URL}. Is your server running? Error: {e}")
        

# --- 4. Main Matching Logic (Updated to use DB POST) ---
def conduct_ai_job_matching():
    """Runs the main job matching flow and posts results to the database."""
    
    # 1. Fetch Data
    candidates = fetch_data(CANDIDATE_URL)
    jobs = fetch_data(JOB_URL)

    if not candidates or not jobs:
        print("\n--- Matching aborted: Data retrieval failed. ---")
        return

    print(f"\n--- Data Retrieved: {len(candidates)} Candidates, {len(jobs)} Jobs ---")
    
    # 2. Setup LLM Chain
    try:
        matching_chain = setup_llm_chain()
    except ValueError as e:
        print(f"\n--- Setup Error: {e} ---")
        return
        
    final_results = []
    
    # 3. Matching Loop: Candidate-by-Candidate vs All Jobs (with batching to avoid token exhaustion)
    BATCH_SIZE = 5  # Process 5 candidates at a time, then pause
    import time
    
    for batch_idx, candidate in enumerate(candidates):
        candidate_id = candidate.get("id", "N/A")
        candidate_name = candidate.get("name") or candidate.get("personal_identifiers", {}).get("fullName", f"Candidate {candidate_id}")
        
        # Get the clean summary for the payload
        candidate_summary = get_candidate_summary(candidate)
        
        candidate_results = {
            # Use candidate_id as string for pydantic compatibility
            "candidate_id": str(candidate_id), 
            "candidate_name": candidate_name,
            "candidate_summary": candidate_summary, 
            "matches": []
        }
        
        print(f"\nProcessing Candidate: **{candidate_name}** (ID: {candidate_id})")

        # Prepare candidate data for the prompt
        candidate_str = json.dumps(candidate, indent=2)

        for job in jobs:
            
            job_summary = get_job_summary(job) 
            job_id = int(job_summary["job_id"]) if job_summary["job_id"].isdigit() else None
            company_id = int(job_summary["company_id"]) if job_summary["company_id"].isdigit() else None
            
            # Skip if job_id or company_id could not be parsed to integer (as required by Pydantic)
            if job_id is None or company_id is None:
                print(f"  -> Skipping Job: {job_summary['job_title']} due to invalid ID format.")
                continue

            job_title = job_summary["job_title"] 
            company_name = job_summary["company_name"]
            employer_email = job_summary["employer_email"]
            
            # Prepare job data for the prompt
            job_str = json.dumps(job, indent=2)

            print(f"  -> Matching against Job: {job_title} ({company_name}, ID: {job_id})...", end="")

            try:
                # 4. Invoke the LangChain to get the structured match scores and analysis
                scores: MatchScores = matching_chain.invoke({
                    "candidate_profile": candidate_str,
                    "job_profile": job_str
                })
                
                # 5. Compile the results for the POST request payload
                match_data = {
                    "job_id": job_id,
                    "job_title": job_title,
                    "company_name": company_name, 
                    "company_id": company_id, 
                    "employer_email": employer_email,
                    "primary_score": scores.primary_match_score,
                    "secondary_score": scores.secondary_match_score,
                    "tertiary_score": scores.tertiary_match_score,
                    "total_score": scores.total_match_score, # Must be float
                    # Analysis objects need to be dictionaries for the POST request
                    "primary_analysis": scores.primary_analysis.dict(),
                    "secondary_analysis": scores.secondary_analysis.dict(),
                    "tertiary_analysis": scores.tertiary_analysis.dict(),
                }
                
                candidate_results["matches"].append(match_data)
                print(" ✅ DONE.")

            except Exception as e:
                # Handle potential LLM or parsing errors gracefully
                print(f" ❌ ERROR: {e}")
        
        # 6. Post the results for the current candidate to the DB
        if candidate_results["matches"]:
            post_results_to_db(candidate_results)
        
        final_results.append(candidate_results)
        
        # Add delay every BATCH_SIZE candidates to avoid rate limiting
        if (batch_idx + 1) % BATCH_SIZE == 0:
            print(f"\n⏸️  Processed {batch_idx + 1} candidates. Pausing for 2 seconds to avoid rate limits...")
            time.sleep(2)

    # 7. Output Final Results Summary (REMOVED FILE SAVE)
    print("\n" + "="*70)
    print("✨ AI Job Matching Complete: Summary of Results and Analysis (Posted to DB) ✨")
    print("="*70)
    
    for result in final_results:
        # Candidate Details Table
        cand_sum = result['candidate_summary']
        print(f"\n## 👤 Candidate: {result['candidate_name']} (ID: {result['candidate_id']})")
        print("\n| Candidate Detail | Information |")
        print("| :--- | :--- |")
        print(f"| **Name** | {cand_sum['name']} |")
        print(f"| **Email** | {cand_sum['email']} |")
        print(f"| **Location** | {cand_sum['location']} |")
        print(f"| **Work Type Preference** | {cand_sum['work_type_preference']} |")
        print(f"| **Skills** | {cand_sum['skills']} |")
        print(f"| **Accommodations** | {cand_sum['accommodations']} |")
        print(f"| **Communication Preference** | {cand_sum['communication_preference']} |")
        print("-" * 70)


        # Sort matches by the total score in descending order for ranking
        sorted_matches = sorted(
            [m for m in result['matches'] if 'total_score' in m], 
            key=lambda x: x['total_score'], 
            reverse=True
        )
        
        if sorted_matches:
            print("\n**Top Matches:**")
            for i, match in enumerate(sorted_matches):
                if i < 3: # Display top 3 for cleaner summary
                    
                    # Display Match Header and Company Details
                    print(f"\n### 🏆 Match {i+1}: {match['job_title']}")
                    print(f"**Company:** {match['company_name']} (ID: {match['company_id']})")
                    print(f"**Job ID:** {match['job_id']}") 
                    print(f"**Email:** {match['employer_email']}")
                    print(f"**Overall Score: {match['total_score']:.2f}%** (P:{match['primary_score']}% / S:{match['secondary_score']}% / T:{match['tertiary_score']}%)")
                    print("-" * 70)

                else:
                    break
        else:
             print("\nNo successful matches to display.")
    print("="*70)


# --- 5. Candidate-Specific Matching Function ---
def conduct_ai_job_matching_for_candidate(candidate_email: str):
    """Matches a specific candidate with all jobs."""
    
    # 1. Fetch Data
    candidates = fetch_data(CANDIDATE_URL)
    jobs = fetch_data(JOB_URL)
    
    if not candidates or not jobs:
        print("\n--- Matching aborted: Data retrieval failed. ---")
        return
    
    # Find the specific candidate by email
    candidate = None
    for cand in candidates:
        cand_email = cand.get("candidate_email") or cand.get("personal_identifiers", {}).get("emailAddress", "")
        if cand_email.lower() == candidate_email.lower():
            candidate = cand
            break
    
    if not candidate:
        print(f"\n--- Candidate with email {candidate_email} not found. ---")
        return
    
    print(f"\n--- Matching Candidate: {candidate_email} with {len(jobs)} Jobs ---")
    
    # 2. Setup LLM Chain
    try:
        matching_chain = setup_llm_chain()
    except ValueError as e:
        print(f"\n--- Setup Error: {e} ---")
        return
    
    candidate_id = candidate.get("id", "N/A")
    candidate_name = candidate.get("name") or candidate.get("personal_identifiers", {}).get("fullName", f"Candidate {candidate_id}")
    
    # Get the clean summary for the payload
    candidate_summary = get_candidate_summary(candidate)
    
    candidate_results = {
        "candidate_id": str(candidate_id),
        "candidate_name": candidate_name,
        "candidate_summary": candidate_summary,
        "matches": []
    }
    
    print(f"\nProcessing Candidate: **{candidate_name}** (ID: {candidate_id})")
    
    # Prepare candidate data for the prompt
    candidate_str = json.dumps(candidate, indent=2)
    
    for job in jobs:
        job_summary = get_job_summary(job)
        job_id = int(job_summary["job_id"]) if job_summary["job_id"].isdigit() else None
        company_id = int(job_summary["company_id"]) if job_summary["company_id"].isdigit() else None
        
        if job_id is None or company_id is None:
            print(f"  -> Skipping Job: {job_summary['job_title']} due to invalid ID format.")
            continue
        
        job_title = job_summary["job_title"]
        company_name = job_summary["company_name"]
        employer_email = job_summary["employer_email"]
        
        job_str = json.dumps(job, indent=2)
        
        print(f"  -> Matching against Job: {job_title} ({company_name}, ID: {job_id})...", end="")
        
        try:
            scores: MatchScores = matching_chain.invoke({
                "candidate_profile": candidate_str,
                "job_profile": job_str
            })
            
            match_data = {
                "job_id": job_id,
                "job_title": job_title,
                "company_name": company_name,
                "company_id": company_id,
                "employer_email": employer_email,
                "primary_score": scores.primary_match_score,
                "secondary_score": scores.secondary_match_score,
                "tertiary_score": scores.tertiary_match_score,
                "total_score": scores.total_match_score,
                "primary_analysis": scores.primary_analysis.dict(),
                "secondary_analysis": scores.secondary_analysis.dict(),
                "tertiary_analysis": scores.tertiary_analysis.dict(),
            }
            
            candidate_results["matches"].append(match_data)
            print(" ✅ DONE.")
        
        except Exception as e:
            print(f" ❌ ERROR: {e}")
    
    # Post results to DB
    if candidate_results["matches"]:
        post_results_to_db(candidate_results)
        print(f"\n✅ Matching completed for {candidate_email}. {len(candidate_results['matches'])} matches found.")


if __name__ == "__main__":
    conduct_ai_job_matching()

