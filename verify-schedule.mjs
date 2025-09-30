import axios from 'axios';
import * as cheerio from 'cheerio';

async function verifyDrawSchedule() {
  console.log('🔍 Verifying TOTO draw schedule for September 2025...');
  
  try {
    const url = 'https://www.singaporepools.com.sg/DataFileArchive/Lottery/Output/toto_result_draw_list_en.html';
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 30000
    });

    console.log('✅ Fetched draw list successfully');
    
    const $ = cheerio.load(response.data);
    
    // Look for all September 2025 draws
    const septemberDraws = [];
    
    $('option').each((i, option) => {
      const text = $(option).text();
      const value = $(option).attr('value');
      
      if (text.includes('Sep 2025')) {
        septemberDraws.push({
          text: text.trim(),
          drawNumber: value,
          queryString: $(option).attr('queryString')
        });
      }
    });
    
    console.log('\n📅 All September 2025 TOTO draws found:');
    septemberDraws.forEach(draw => {
      console.log(`   ${draw.text} (Draw ${draw.drawNumber})`);
    });
    
    // Check specifically for Sep 22 and Sep 25
    const sep22 = septemberDraws.find(d => d.text.includes('22 Sep'));
    const sep25 = septemberDraws.find(d => d.text.includes('25 Sep'));
    
    console.log('\n🎯 Target dates status:');
    console.log(`September 22: ${sep22 ? 'FOUND - ' + sep22.text : 'NOT FOUND - No draw on this date'}`);
    console.log(`September 25: ${sep25 ? 'FOUND - ' + sep25.text : 'NOT FOUND - No draw on this date'}`);
    
    // Show typical TOTO schedule
    console.log('\n📋 TOTO typically draws on:');
    console.log('   - Monday evenings');
    console.log('   - Thursday evenings');
    console.log('   - September 22, 2025 was a Sunday');
    console.log('   - September 25, 2025 was a Wednesday');
    
    // Show actual September draws that did occur
    console.log('\n✅ Actual September draws (Monday/Thursday):');
    const actualDraws = septemberDraws.filter(d => 
      d.text.includes('Mon,') || d.text.includes('Thu,')
    );
    
    actualDraws.forEach(draw => {
      console.log(`   ${draw.text}`);
    });
    
    return {
      allSeptemberDraws: septemberDraws,
      sep22Exists: !!sep22,
      sep25Exists: !!sep25,
      actualDraws
    };
    
  } catch (error) {
    console.error('❌ Error verifying draw schedule:', error.message);
    return null;
  }
}

verifyDrawSchedule().catch(console.error);