# How to Populate Appointment Data for Job Coach

## Current State

The `AppointmentPage` component is currently shared between:
- **Candidate Dashboard** (`/candidate/candidate-dashboard/Appointment/page.tsx`)
- **Job Coach Dashboard** (`/job-coach/page.tsx` - imports the same component)

### Current Data Flow (Candidate View):
1. Fetches **ALL** appointments from `/appointment/all` endpoint
2. Fetches job coaches from `/api/job-coach/all` 
3. Shows available appointments (where `candidate === null`)
4. Allows candidates to book appointments

### Current Data Flow (Job Coach View):
- **Problem**: Job coaches see ALL appointments, not just their own
- They need to see only appointments where `jobCoach` matches their email/name

## Backend API Structure

### Appointment Model:
```python
class Appointment(Base):
    __tablename__ = "appointment"
    id = Column(Integer, primary_key=True, index=True)
    jobCoach = Column(String)  # Stores job coach email or name
    candidate = Column(String)  # Stores candidate email (null if available)
    dateTime = Column(DateTime)
```

### Available Endpoints:
- `GET /appointment/all` - Returns all appointments
- `POST /appointment/` - Create new appointment slot (requires `jobCoach` and `dateTime`)
- `PUT /appointment/book?id={id}&candidate={email}` - Book appointment
- `PUT /appointment/unbook?id={id}` - Unbook appointment
- `DELETE /appointment/{id}` - Delete appointment

## Required Changes

### 1. Modify `AppointmentPage` to Detect User Role

The component needs to know if it's being used by a candidate or job coach:

```typescript
// Option A: Pass a prop
interface AppointmentPageProps {
  isJobCoach?: boolean;
}

export default function AppointmentPage({ isJobCoach = false }: AppointmentPageProps = {}) {
  // ...
}

// Option B: Detect from session/user context
// Check if user is a job coach by checking their role or email domain
```

### 2. Filter Appointments for Job Coaches

When `isJobCoach === true`:
- Filter appointments where `jobCoach` matches the logged-in job coach's email/name
- Show both available (`candidate === null`) and booked (`candidate !== null`) appointments
- Allow job coaches to:
  - Create new appointment slots
  - View booked appointments
  - Cancel/unbook appointments
  - Delete appointment slots

### 3. Update `fetchAppointments` Function

```typescript
const fetchAppointments = async () => {
  try {
    let url = `${APPOINTMENT_BASE_URL}/all`;
    
    // If job coach, filter by their email/name
    if (isJobCoach && session?.user?.email) {
      // Option 1: Filter on frontend
      // Fetch all, then filter
      
      // Option 2: Backend endpoint (recommended)
      // Create: GET /appointment/coach/{coachEmail}
      url = `${APPOINTMENT_BASE_URL}/coach/${encodeURIComponent(session.user.email)}`;
    }
    
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch appointments");
    const data: Appointment[] = await res.json();
    const converted = data.map(a => ({ ...a, dateTime: new Date(a.dateTime) }));
    setAppointments(converted);
  } catch (err) {
    console.error(err);
  }
};
```

### 4. Update Job Coach Dashboard Usage

```typescript
// In job-coach/page.tsx
{activeTab === "appointment" && (
  <AppointmentPage isJobCoach={true} />
)}
```

### 5. Different UI for Job Coaches

Job coaches should see:
- **Left Panel**: Their appointment calendar (not coach selection)
- **Right Panel**: 
  - Calendar view of their slots
  - Ability to create new slots
  - List of booked appointments with candidate names
  - Ability to cancel/delete slots

## Recommended Implementation Steps

### Step 1: Create Backend Endpoint (Optional but Recommended)
```python
# In backend/consolidated/routers/bookedAppointments.py

@router.get("/coach/{coach_email}")
async def get_appointments_by_coach(coach_email: str, db: DbDep):
    """Get all appointments for a specific job coach"""
    appointments = db.query(Appointment).filter(
        Appointment.jobCoach == coach_email
    ).all()
    return appointments
```

### Step 2: Update Frontend Component
1. Add `isJobCoach` prop to `AppointmentPage`
2. Conditionally fetch/filter appointments based on role
3. Show different UI based on role:
   - **Candidate**: Coach selection → Calendar → Booking
   - **Job Coach**: Calendar → Create slots → Manage bookings

### Step 3: Add Job Coach Features
- **Create Slot Button**: Opens form to create new appointment slot
- **Booked Appointments List**: Shows appointments with `candidate !== null`
- **Cancel/Delete Actions**: Allow job coaches to manage their slots

## Example Code Structure

```typescript
// In AppointmentPage component
const { data: session } = useSession();
const coachEmail = session?.user?.email;

// Determine if user is job coach
const isJobCoach = props.isJobCoach || false;

// Fetch appointments
useEffect(() => {
  if (isJobCoach) {
    // Fetch only this coach's appointments
    fetchCoachAppointments(coachEmail);
  } else {
    // Fetch all appointments (candidate view)
    fetchAppointments();
  }
}, [isJobCoach, coachEmail]);

// Filter logic
const myAppointments = isJobCoach 
  ? appointments.filter(a => a.jobCoach === coachEmail)
  : appointments;

const availableSlots = myAppointments.filter(a => a.candidate === null);
const bookedSlots = myAppointments.filter(a => a.candidate !== null);
```

## Current Issues

1. **No Role Detection**: Component doesn't know if user is candidate or job coach
2. **Shows All Appointments**: Job coaches see everyone's appointments
3. **No Create Slot UI**: Job coaches can't create new appointment slots
4. **No Management UI**: Job coaches can't see/manage their booked appointments

## Next Steps

1. ✅ Add `isJobCoach` prop to `AppointmentPage`
2. ✅ Filter appointments by coach email when `isJobCoach === true`
3. ✅ Create backend endpoint `/appointment/coach/{email}` (optional)
4. ✅ Add UI for job coaches to create new slots
5. ✅ Show booked appointments list for job coaches
6. ✅ Add cancel/delete functionality for job coaches

