import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testTrigger() {
  console.log('\n🧪 Testing Notification Trigger...\n');

  try {
    // Get an artisan to use as test client
    const { data: artisan, error: artisanError } = await supabase
      .from('artisans')
      .select('user_id')
      .limit(1)
      .single();

    if (artisanError || !artisan) {
      console.error('❌ Could not find a user to test with');
      return;
    }

    // Check initial notification count
    const { count: beforeCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Current notifications in system: ${beforeCount}\n`);

    // Create a test job as "brouillon"
    console.log('1️⃣  Creating test job with brouillon status...');
    const { data: testJob, error: jobError } = await supabase
      .from('job_requests')
      .insert({
        client_id: artisan.user_id,
        titre: 'Test - Réparation plomberie urgente',
        description: 'Ceci est un test du système de notification',
        categorie: 'Plomberie',
        statut: 'brouillon',
        budget_max: 150000,
        localisation: 'Test Zone',
        ville: 'Ouagadougou'
      })
      .select()
      .single();

    if (jobError) {
      console.error('❌ Failed to create test job:', jobError.message);
      return;
    }

    console.log('✅ Test job created');
    console.log(`   Job ID: ${testJob.id}`);
    console.log(`   Category: ${testJob.categorie}\n`);

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Now publish the job (this should trigger notifications)
    console.log('2️⃣  Publishing the job (changing status to "publiee")...');
    const { error: updateError } = await supabase
      .from('job_requests')
      .update({ statut: 'publiee' })
      .eq('id', testJob.id);

    if (updateError) {
      console.error('❌ Failed to publish job:', updateError.message);
      await supabase.from('job_requests').delete().eq('id', testJob.id);
      return;
    }

    console.log('✅ Job published successfully\n');

    // Wait for trigger to execute
    console.log('⏳ Waiting 3 seconds for trigger to execute...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check if new notifications were created
    console.log('3️⃣  Checking for new notifications...');
    const { count: afterCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Notifications after publish: ${afterCount}\n`);

    // Check specifically for notifications related to our test job
    const { data: relatedNotifs, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('related_job_id', testJob.id);

    if (notifError) {
      console.error('❌ Error checking notifications:', notifError.message);
    } else if (relatedNotifs && relatedNotifs.length > 0) {
      console.log('✅ TRIGGER IS WORKING!');
      console.log(`   ${relatedNotifs.length} notification(s) created for this job:\n`);

      relatedNotifs.forEach((notif, idx) => {
        console.log(`   ${idx + 1}. "${notif.title}"`);
        console.log(`      To user: ${notif.user_id}`);
        console.log(`      Type: ${notif.type}`);
        console.log(`      Message: ${notif.message}`);
      });
      console.log('');
    } else {
      console.log('❌ TRIGGER NOT WORKING!');
      console.log('   No notifications were created for this job');
      console.log('   Possible reasons:');
      console.log('   - Trigger function does not exist');
      console.log('   - Trigger is not enabled');
      console.log('   - No artisans match the job category');
      console.log('   - RLS policies are blocking notification creation\n');

      // Check for plombiers in the system
      console.log('🔍 Checking for plombiers in the system...');
      const { data: artisans, error: artError } = await supabase
        .from('artisans')
        .select('id, user_id, nom, prenom, metier');

      if (!artError && artisans) {
        const plombiers = artisans.filter(a => {
          try {
            const metiers = Array.isArray(a.metier) ? a.metier : JSON.parse(a.metier);
            return metiers.some(m => m && m.toLowerCase().includes('plomb'));
          } catch {
            return false;
          }
        });

        console.log(`   Found ${plombiers.length} plombier(s) in the system`);
        if (plombiers.length === 0) {
          console.log('   ⚠️  This is why no notifications were sent!\n');
        }
      }
    }

    // Clean up test job and its notifications
    console.log('🧹 Cleaning up test data...');
    if (relatedNotifs && relatedNotifs.length > 0) {
      await supabase
        .from('notifications')
        .delete()
        .eq('related_job_id', testJob.id);
      console.log('   ✅ Test notifications deleted');
    }

    await supabase
      .from('job_requests')
      .delete()
      .eq('id', testJob.id);
    console.log('   ✅ Test job deleted\n');

    console.log('✅ Test complete!\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error(error);
  }
}

testTrigger();
