import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Use service role key to check system-level database objects
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verifyTrigger() {
  console.log('\n🔍 Verifying Notification Trigger Setup...\n');

  try {
    // Check if trigger exists
    console.log('1️⃣  Checking for trigger...');
    const { data: triggers, error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          tgname as trigger_name,
          tgtype,
          tgenabled,
          pg_get_triggerdef(oid) as trigger_definition
        FROM pg_trigger
        WHERE tgname = 'notify_artisans_on_job_published';
      `
    }).catch(() => {
      // If rpc doesn't work, try a direct query
      return { data: null, error: 'RPC not available' };
    });

    if (triggerError) {
      console.log('⚠️  Cannot check trigger directly (may need service role key)');
      console.log('   Checking indirectly...\n');
    } else if (triggers && triggers.length > 0) {
      console.log('✅ Trigger found:', triggers[0].trigger_name);
      console.log('   Status:', triggers[0].tgenabled === 'O' ? 'Enabled' : 'Disabled');
      console.log('');
    }

    // Test notification creation manually
    console.log('2️⃣  Testing manual notification creation...');

    // Get an artisan user_id
    const { data: artisan, error: artisanError } = await supabase
      .from('artisans')
      .select('user_id')
      .limit(1)
      .single();

    if (artisanError || !artisan) {
      console.error('❌ Could not find an artisan to test with');
      return;
    }

    // Try to create a test notification
    const { data: testNotif, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: artisan.user_id,
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working',
        read: false
      })
      .select()
      .single();

    if (notifError) {
      console.error('❌ Failed to create test notification:', notifError.message);
      console.log('   This suggests there may be an RLS policy issue\n');
    } else {
      console.log('✅ Test notification created successfully!');
      console.log('   ID:', testNotif.id);

      // Clean up test notification
      await supabase
        .from('notifications')
        .delete()
        .eq('id', testNotif.id);
      console.log('   Test notification cleaned up\n');
    }

    // Check if trigger function exists
    console.log('3️⃣  Checking for trigger function...');
    const { data: functions, error: funcError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          proname as function_name,
          prosecdef as security_definer
        FROM pg_proc
        WHERE proname = 'notify_artisans_of_new_job';
      `
    }).catch(() => ({ data: null, error: 'RPC not available' }));

    if (funcError) {
      console.log('⚠️  Cannot check function directly\n');
    } else if (functions && functions.length > 0) {
      console.log('✅ Function found:', functions[0].function_name);
      console.log('   Security Definer:', functions[0].security_definer ? 'Yes' : 'No');
      console.log('');
    }

    // Manually test trigger logic
    console.log('4️⃣  Testing trigger logic manually...');
    console.log('   Creating a test job with "brouillon" status...');

    const { data: testJob, error: jobError } = await supabase
      .from('job_requests')
      .insert({
        client_id: artisan.user_id,
        titre: 'Test Job for Notification Trigger',
        description: 'This is a test job to verify notification trigger',
        categorie: 'Plomberie',
        statut: 'brouillon',
        budget_max: 100000,
        localisation: 'Test Location',
        ville: 'Test City'
      })
      .select()
      .single();

    if (jobError) {
      console.error('❌ Failed to create test job:', jobError.message);
      return;
    }

    console.log('✅ Test job created with ID:', testJob.id);
    console.log('   Now publishing the job...\n');

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check notifications before publishing
    const { count: beforeCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });

    console.log('   Notifications before publish:', beforeCount);

    // Update status to publiee (this should trigger notification)
    const { error: updateError } = await supabase
      .from('job_requests')
      .update({ statut: 'publiee' })
      .eq('id', testJob.id);

    if (updateError) {
      console.error('❌ Failed to publish test job:', updateError.message);
    } else {
      console.log('✅ Job published successfully');
    }

    // Wait for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check notifications after publishing
    const { count: afterCount, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });

    console.log('   Notifications after publish:', afterCount);

    if (countError) {
      console.error('❌ Error counting notifications:', countError.message);
    } else if (afterCount > beforeCount) {
      console.log('✅ TRIGGER IS WORKING! New notifications were created');

      // Show the new notifications
      const { data: newNotifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('related_job_id', testJob.id);

      if (newNotifs && newNotifs.length > 0) {
        console.log(`   ${newNotifs.length} notification(s) created for artisans\n`);
      }
    } else {
      console.log('❌ TRIGGER NOT WORKING! No new notifications were created');
      console.log('   This means the trigger is either missing or not executing properly\n');
    }

    // Clean up test job
    await supabase
      .from('job_requests')
      .delete()
      .eq('id', testJob.id);
    console.log('🧹 Test job cleaned up\n');

    console.log('✅ Verification complete!\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

verifyTrigger();
