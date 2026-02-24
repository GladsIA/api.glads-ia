import { NextResponse } from 'next/server';
import { Company } from '@/entities/companies/Company';
import { companyRepository } from '@/repositories/companyRepository';

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, cnpj } = body;
        if(!name || !cnpj) {
            return NextResponse.json(
                { error: 'Name and cnpj are required' },
                { status: 400 }
            );
        }
        const company = new Company({ name, cnpj });
        const data = await companyRepository.create(company);
        const savedCompany = Company.fromDatabase(data);
        return NextResponse.json(
            { company: savedCompany },
            { status: 201 }
        );
    } catch(error) {
        console.error('Create company error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}