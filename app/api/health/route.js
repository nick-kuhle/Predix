import {NextResponse} from 'next/server';
export async function GET(){return NextResponse.json({status:'ok',service:'predix',version:'2.0',time:new Date().toISOString(),capabilities:{marketData:true,timesfm:true,optionsSurface:true,volatilityFeatures:true,backtestingFoundation:true}})}
