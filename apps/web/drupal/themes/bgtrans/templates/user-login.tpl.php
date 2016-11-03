<?php
//print '<pre>';
//print_r($variables);
//print_r($form);
//print '</pre>';
//dpm(get_defined_vars());
?>
<div class="bgtrans-user-login-form-wrapper">
    <?php //print drupal_render_children($form) ?>

    <div class="row">
        <!-- <div class="login-wrapper"> -->
        <div class="col-md-4">

            <h2><?php print render($intro_text); ?></h2>

            <?php
            // split the username and password from the submit button so we can put in links above
            // $form = drupal_get_form('user_login');
            // print drupal_render($form);
            print drupal_render($form['name']);
            print drupal_render($form['pass']);

            ?>
            <!--
                <div class="user-links">
                    <span class="passlink"><a href="/user/password">Forget your password?</a></span> | <span class="reglink"><a href="/user/register">Create an account</a></span>
                </div>
            -->
            <?php
            print drupal_render($form['form_build_id']);
            print drupal_render($form['form_id']);
            print drupal_render($form['actions']);
            ?>

        </div><!--//login-wrapper-->

        <!-- <div class="login-photo"> -->
        <div class="col-md-8">
            <img src="<?php print base_path() . drupal_get_path('theme', 'bgtrans')
                . '/images/login-photo.jpg'; ?>"
                 class="img-responsive"
                 alt="Login" title="Login"/>
            <!-- alt="Login" title="Login" width='327' height='221' /> -->
        </div>

    </div>
</div>

