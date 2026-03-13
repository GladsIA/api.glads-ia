import { NextResponse } from 'next/server';
import { Organization } from '@/entities/organizations/Organization';
import { OrganizationRepository } from '@/repositories/OrganizationRepository';

export async function GET() {
    try {
        const organizationRepository = new OrganizationRepository();
        const organizations = await organizationRepository.findMany();
        return NextResponse.json(
            { organizations },
            { status: 200 }
        );
    } catch(error) {
        console.error('Get organizations error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const organization = new Organization(body);
        if(!organization.name || !organization.cnpj) {
            return NextResponse.json(
                { error: 'Name and cnpj are required' },
                { status: 400 }
            );
        }
        const organizationRepository = new OrganizationRepository();
        const data = await organizationRepository.create(organization);
        const savedOrganization = Organization.fromDatabase(data);
        return NextResponse.json(
            { organization: savedOrganization },
            { status: 201 }
        );
    } catch(error) {
        console.error('Create organization error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}