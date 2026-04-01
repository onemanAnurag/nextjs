// app/api/patients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Patient } from '@/types/patient';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search')?.toLowerCase() || '';
  const medicalIssue = searchParams.get('issue') || '';
  const sortBy = searchParams.get('sortBy') || 'id'; // 'name', 'age', 'id'
  const sortOrder = searchParams.get('sortOrder') || 'asc';

  try {
    const jsonDirectory = path.join(process.cwd(), 'data');
    const fileContents = await fs.readFile(jsonDirectory + '/MOCK_DATA.json', 'utf8');
    let data: Patient[] = JSON.parse(fileContents);

    // 1. Search Logic
    if (search) {
      data = data.filter(p => 
        p.patient_name.toLowerCase().includes(search) || 
        p.patient_id.toString().includes(search)
      );
    }

    // 2. Filter Logic
    if (medicalIssue) {
      data = data.filter(p => p.medical_issue === medicalIssue);
    }

    // 3. Sort Logic
    data.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.patient_name.localeCompare(b.patient_name);
      else if (sortBy === 'age') comparison = a.age - b.age;
      else comparison = a.patient_id - b.patient_id;
      
      return sortOrder === 'desc' ? comparison * -1 : comparison;
    });

    // 4. Pagination Logic
    const total = data.length;
    const offset = (page - 1) * limit;
    const paginatedPatients = data.slice(offset, offset + limit);

    return NextResponse.json({
      patients: paginatedPatients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}